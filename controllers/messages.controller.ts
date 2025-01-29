import { Request, Response } from "express";
import Message from "../models/message";

interface ListApiModel {
  from: string,
  to: string,
  status: string,
};

const cleanProperties = (i: ListApiModel): ListApiModel => {
  const addPlusPrefix = (value?: string): string | undefined => {
    // We add the missing + char to the front of the property string
    return value && !value.startsWith("+") ? `+${value}` : value;
  };

  return {
    ...i,
    from: addPlusPrefix(i.from),
    to: addPlusPrefix(i.to),
  } as ListApiModel;
};

const getSafeQueryNumberArgument = (req: Request, name: string, defaultValue: number): number => {
  const queryValue = req.query[name];

  if (queryValue !== undefined) {
    const parsedValue = Number(queryValue);
    
    // Check if the parsed value is a valid number
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
    
      // Fetch the most recent message between 'from' and 'to'
      const previousMessage = await Message.findOne({ 
        where: { from, to },
        order: [['received_at', 'DESC']],
      });
    
      // Determine if a new message can be sent
      const canSendNewMessage = !previousMessage || 
        (new Date().getTime() - new Date(previousMessage.received_at).getTime()) > 2000;
      
      if (canSendNewMessage) {
        const newMessage = await Message.create({ from, to, message });
        res.status(201).json(newMessage);
      } else {
        res.status(429).json({ error: "Too many requests. Please wait before sending another message." });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const filterArgs = cleanProperties(req.query as unknown as ListApiModel);
      const limit = getSafeQueryNumberArgument(req, 'limit', 10);
      const offset = getSafeQueryNumberArgument(req, 'offset', 0);
      const messages = await Message.findAndCountAll({
        where: {...filterArgs},
        order: [['received_at', 'DESC']],
        limit: limit,
        offset: offset,
      });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
}