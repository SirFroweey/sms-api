import { Request, Response } from 'express';
import sequelize from '../models/index';
import Message from '../models/message';
import Media from '../models/media';
import { getSafeQueryNumberArgument, CustomRequest } from './index';

export interface ListApiModel {
  from: string,
  to: string,
  status: string,
};

/**
 * Ensures that the from and to properties have a '+' character at the beginning of the string.
 * @param i ListApiModel interface
 * @returns New ListApiModel interface with modified properties
 */
export const cleanProperties = (i: ListApiModel): ListApiModel => {
  const addPlusPrefix = (propertyValue: string): string => {
    if (!propertyValue.startsWith('+'))
    {
      propertyValue = '+' + propertyValue;
    }
    return propertyValue;
  };

  var newObject: Record<string,any> = {}

  if (i.status) {
    newObject.status = i.status;
  }

  if (i.from) {
    newObject.from = addPlusPrefix(i.from);
  }

  if (i.to) {
    newObject.to = addPlusPrefix(i.to);
  }

  return newObject as ListApiModel;
};

export default class MessagesController {
  async create(req: CustomRequest, res: Response) {
    try {
      const { from, to, message } = req.body;
      const { isFileValid } = req;

      // Exit early if we encountered an issue with the uploaded file.
      if (isFileValid === false) {
        const errorMessage = 'You cannot upload the same image more than twice. Also, please ensure it is either a JPG or PNG.';
        res.status(400).json({ error: errorMessage });
        return;
      }

      // Determine if we can create a new message
      const twoSeconds = 2 * 1000;
      const previousMessage = await Message.findOne({ 
        where: { from, to },
        order: [['receivedAt', 'DESC']],
      });

      // Create new message (if we can)
      const canSubmit = !previousMessage || 
        (new Date().getTime() - new Date(previousMessage.receivedAt).getTime()) > twoSeconds;
      
      if (canSubmit) {
        const newMessage = await Message.create({ from, to, message });
        // Attach the given image file to the newly created message if it exists in the payload
        if (req.file) {
          const { path, originalname, mimetype } = req.file;
          console.log(`Image uploaded successfully: ${path}`);
          const transaction = await sequelize.transaction();
          try {
            const newAttachment = await Media.create(
              { messageId: newMessage.id, path, fileName: originalname, mimeType: mimetype },
              { transaction }
            );
            // Update message with newly created mediaId
            await newMessage.update({ mediaId: newAttachment.id }, { transaction });
            // Now we can safely commit the transaction
            await transaction.commit();
          } catch (err) {
            // Rollback transaction if an error is raised with the attachment of the given image 
            await transaction.rollback();
            console.error('Error attaching image to message:', err);
            return res.status(500).json({ error: 'Failed to attach image to message.' });
          }
        }
        res.status(201).json(newMessage);
      } else {
        res.status(429).json({ error: 'You have submitted too many requests. Please wait before sending another message.' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Oops! An Internal Server Error has occurred.' });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const message: Message | null = await Message.findOne({ 
        where: { id: messageId },
        include: Media
      });
    
      if (!message) {
        return res.status(404).json({ error: 'No message found for the given message id.' });
      }
    
      const media = message.getDataValue('Medium');
      
      if (media) {
        return res.status(200).json(media);
      } else {
        return res.status(400).json({ error: 'This message does not have an attachment.' });
      }
    } catch (error) {
      res.status(500).json({ error: error });
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