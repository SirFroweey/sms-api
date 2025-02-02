import { ValidationError } from 'sequelize';

import Message, { e164 } from '../../models/message';
import Media from '../../models/media';
import sequelize from '../../models';

describe('test message sequelize model', () => {
  let thisDb: any = sequelize;

  beforeAll(async () => {
    await thisDb.sync({ force: true });
  });

  it('should succeed when creating a new message with all required data', async () => {
    const from: string = '+16612222222';
    const to: string = '+16619999999';
    const message: string = 'Hello, World';
    const newMessage: Message = await Message.create({ from, to, message });
    expect(newMessage.status).toBe('active');
  });

  it('should fail when creating a new message without all required data', async () => {
    const from: string = '+16612222222';
    const to: string = '+16619999999';
    const message: string | null = null;
    await expect(Message.create({ from, to, message })).rejects.toThrow(
      ValidationError,
    );
  });

  it('should fail when creating a new message with an invalid phone number', async () => {
    const from: string = '6613338888'; // invalid format
    const to: string = '+16619999999';
    const message: string | null = null;
    await expect(Message.create({ from, to, message })).rejects.toThrow(
      ValidationError,
    );
  });

  it('should succeed when creating a new message with an attachment', async () => {
    const from: string = '+16612222222';
    const to: string = '+16619999999';
    const message: string = 'Hello, World!';
    const newMessage: Message = await Message.create({ from, to, message });

    const fileName: string = 'fake-file.png';
    const path: string = `tmp/uploads/${fileName}`;
    const mimeType: string = 'image/png';
    const newAttachment: Media = await Media.create({ 
      messageId: newMessage.id,
      path,
      fileName,
      mimeType 
    });

    await newMessage.update({ mediaId: newAttachment.id });

    expect(newAttachment.messageId).toBe(newMessage.id);
    expect(newMessage.mediaId).toBe(newAttachment.id);
  });

  afterAll(async () => {
    await thisDb.close();
  });
});

describe('test helper functions', () => {
  it('should fail e164 invocation with invalid input', async () => {
    try { 
      e164('6616001010');
    } catch (error) {
        expect(error).toMatchObject(Error('Invalid phone number format.'));
    }
  });
});