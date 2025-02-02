import Media from '../../models/media';
import Message from '../../models/message';
import sequelize from '../../models';

import { Sequelize } from 'sequelize-typescript';
import { ValidationError } from 'sequelize';

describe('test media sequelize model', () => {
  let thisDb: Sequelize = sequelize;

  beforeAll(async () => {
    await thisDb.sync({ force: true });
  });

  it('should fail when creating a new message with an attachment with an invalid mimetype', async () => {
    const from: string = '+16612222222';
    const to: string = '+16619999999';
    const message: string = 'Hello, World!';
    const newMessage: Message = await Message.create({ from, to, message });

    const fileName: string = 'fake-file.png';
    const path: string = `tmp/uploads/${fileName}`;
    const mimeType: string = 'image/gif'; // invalid mime-type

    try {
      await Media.create({ 
        messageId: newMessage.id,
        path,
        fileName,
        mimeType 
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
    }
  });

  afterAll(async () => {
    await thisDb.close();
  });
});