import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import Media from '../models/media';

/**
 * for imageAttachmentFilter function below, used to insert custom property (isFileValid) onto Request object.
 */
export interface CustomRequest extends Request {
    isFileValid: boolean,
};

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
const fileStoragePath = './tmp/uploads';

const imageStorage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, callBack: DestinationCallback) {
    callBack(null, fileStoragePath);
  },
  filename: function (req: Request, file: Express.Multer.File, callBack: FileNameCallback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callBack(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// Filter for allowed image (jpg, png) types
const imageAttachmentFilter = async (req: CustomRequest, file: Express.Multer.File, callBack: Function) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  const imageNotUploaded = !await Media.findOne({ 
    where: { fileName: file.originalname } 
  });

  const isFileValid = extName && mimeType && imageNotUploaded;
  req.isFileValid = isFileValid;
  return callBack(null, isFileValid);
  
//   if (extName && mimeType && imageNotUploaded) {
//     return callBack(null, true);
//   } else {
//     callBack(new Error('Error: It seems that either this file has already been attached or it is not a JPG or PNG image.'));
//   }
};
  
// Initialize multer with storage and filter options
export const upload = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Lets limit the file size to 5MB
  fileFilter: imageAttachmentFilter,
});

/**
 * 
 * @param req Request.
 * @param name Name of request query parameter.
 * @param defaultValue Default value if parameter is not provided on the request query.
 * @returns Request query parameter in number format or the defaultValue if not specified.
 */
export const getSafeQueryNumberArgument = (req: Request, name: string, defaultValue: number): number => {
  const queryValue = req.query[name];
  if (queryValue !== undefined) {
    const parsedValue = Number(queryValue);
    // Let's ensure that the parsed value is a valid number...
    if (!isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  return defaultValue;
};