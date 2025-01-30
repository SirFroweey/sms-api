import { Request, Response } from 'express';
import Message from '../models/message';

interface ListApiModel {
  from: string,
  to: string,
  status: string,
};

const cleanProperties = (i: ListApiModel): ListApiModel => {
  const addPlusPrefix = (propertyValue: string): string => {
    /** 
     * This function is used to basically add the missing + char to the front of the string if its missing
     */
    if (!propertyValue.startsWith('+'))
    {
      propertyValue = '+' + propertyValue;
    }
    return propertyValue;
  };

  return {
    from: addPlusPrefix(i.from),
    to: addPlusPrefix(i.to),
    status: i.status,
  } as ListApiModel;
};

const getSafeQueryNumberArgument = (req: Request, name: string, defaultValue: number): number => {
  const queryValue = req.query[name];
  if (queryValue !== undefined) {
    const parsedValue = Number(queryValue);
    // Let's ensure that the parsed value is a valid number...
    if (!isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  return defaultValue;
}

export default class MessagesController {
  async create(req: Request, res: Response) {
    try {
      const { from, to, message } = req.body;
      const twoSeconds = 2 * 1000;
      const previousMessage = await Message.findOne({ 
        where: { from, to },
        order: [['receivedAt', 'DESC']],
      });
      const canSubmit = !previousMessage || 
        (new Date().getTime() - new Date(previousMessage.receivedAt).getTime()) > twoSeconds;

      if (canSubmit) {
        const newMessage = await Message.create({ from, to, message });
        res.status(201).json(newMessage);
      } else {
        res.status(429).json({ error: 'You have submitted too many requests. Please wait before sending another message.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Oops! An Internal Server Error has occurred.' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const filterArgs = cleanProperties(req.query as unknown as ListApiModel);
      const limit = getSafeQueryNumberArgument(req, 'limit', 10);
      const offset = getSafeQueryNumberArgument(req, 'offset', 0);
      const messages = await Message.findAndCountAll({
        where: {...filterArgs},
        order: [['receivedAt', 'DESC']],
        limit: limit,
        offset: offset,
      });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
}