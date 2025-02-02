import { Sequelize } from 'sequelize-typescript';
import supertest from "supertest";
import path from 'path';

import { app } from '../../app'; 
import sequelize from '../../models';
import { cleanProperties, ListApiModel } from '../../controllers/messages.controller';
import Message from '../../models/message';
import Media from '../../models/media';

const testImage = path.resolve(__dirname, './test-image.png');
const testImage2 = path.resolve(__dirname, './test-image2.png');

const delay = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('test message controller utility helper functions', () => { 
  it('should clean from and to properties from ListApiModel instance and prepend + character', () => {
    const i = {
      from: '16615554433',
      to: '16619998877',
      status: 'pending'
    } as ListApiModel;
    const modifedInterface = cleanProperties(i);
    expect(modifedInterface).toMatchObject({
      from: '+16615554433',
      to: '+16619998877',
      status: 'pending'
    } as ListApiModel);
  });
});

describe('test message controller', () => {
  let db: Sequelize = sequelize;

  beforeAll(async () => {
    await db.sync({ force: true })
  });

  it('should create new message with no attachment', async () => {
    const from = '+16612022222';
    const to = '+16613339988';
    const message = 'Hello, World!';
    const payload = {
      from: from,
      to: to,
      message: message
    };

    const response = await supertest(app)
      .post('/api/messages')
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      id: response.body.id,
      receivedAt: response.body.receivedAt,
      status: 'active',
      from: from,
      to: to,
      message: message,
    });
  });

  it('should fail to create new message due to rate limit for same from and to fields', async () => {
    const from = '+16612022222';
    const to = '+16613339988';
    const message = 'Hello, World!';
    const payload = {
      from: from,
      to: to,
      message: message
    };

    const response = await supertest(app)
      .post('/api/messages')
      .send(payload)
      .expect(429);
  });

  it('should create new message with image attachment after waiting more than 2 seconds when using same from and to fields as previous request', async () => {
    const from = '+16612022222';
    const to = '+16613339988';
    const message = 'Hello, World!';

    await delay(2500);

    const response = await supertest(app)
      .post('/api/messages')
      .field('from', from)
      .field('to', to)
      .field('message', message)
      .attach('image', testImage, { contentType: 'image/png' });
    
    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      id: response.body.id,
      receivedAt: response.body.receivedAt,
      status: 'active',
      from: from,
      to: to,
      message: message,
      mediaId: response.body.mediaId
    });
  });

  it('should pass first time but fail seconds time due to from/to duplication', async () => {
    const from = '+16612022222';
    const to = '+16613339988';
    const message = 'Hello, World!';
    const payload = {
      from: from,
      to: to,
      message: message
    };

    let response;
    for (let x = 0; x < 2; x++) {
      switch (x) {
        case 0:
          await delay(2000);

          response = await supertest(app)
            .post('/api/messages')
            .send(payload);
          
          expect(response.status).toBe(201);
          expect(response.body).toMatchObject({
            id: response.body.id,
            receivedAt: response.body.receivedAt,
            status: 'active',
            from: from,
            to: to,
            message: message
          }); 
          break;
        
        case 1:
          response = await supertest(app)
            .post('/api/messages')
            .send(payload);
          
          expect(response.status).toBe(429);
          break;
      }
    }
  });

  it('should pass first time but fail seconds time due to image upload duplication', async () => {
    let from;
    let to;
    let message;

    const payloads = [
      {
        from: '+16612027777',
        to: '+16613337777',
        message: 'Hello, World!'
      },
      {
        from: '+16612021111',
        to: '+16613331122',
        message: 'Hello, World!'
      }
    ];

    let response;
    for (let x = 0; x < 2; x++) {

      ({ from, to, message } = payloads[x]);

      switch (x) {
        case 0:
          await delay(2000);

          response = await supertest(app)
            .post('/api/messages')
            .field('from', from)
            .field('to', to)
            .field('message', message)
            .attach('image', testImage2, { contentType: 'image/png' });
          
          expect(response.status).toBe(201);
          expect(response.body).toMatchObject({
            id: response.body.id,
            receivedAt: response.body.receivedAt,
            status: 'active',
            from: from,
            to: to,
            message: message
          }); 
          break;
        
        case 1:
          response = await supertest(app)
            .post('/api/messages')
            .field('from', from)
            .field('to', to)
            .field('message', message)
            .attach('image', testImage2, { contentType: 'image/png' });
          
          expect(response.status).toBe(400);
          break;
      }
    }
  });

  it('should list all previously created messages successfully', async () => {
    const from: string = '+16615009988';
    const to: string = '+16614000835';
    const message: string = 'sample';
    const status: string = 'active';
    const offset: number = 0;
    const limit: number = 10;

    await Message.create({ from, to, message });

    const response = await supertest(app)
      .get('/api/messages')
      .query({ from: from, to: to, status: status, offset: offset, limit: limit });
    
    expect(response.status).toBe(200);
    expect(response.body.rows.length).toBe(1);
  });

  it('should get existing message/media by id successfully', async () => {
    const from: string = '+16615009912';
    const to: string = '+16614000812';
    const message: string = 'sample';

    const msg: Message = await Message.create({ from, to, message });

    const fileName: string = 'a-fake-file.png';
    const path: string = `./tmp/uploads/${fileName}`;
    const mimeType: string = 'image/png';
    const newAttachment: Media = await Media.create({ 
      messageId: msg.id,
      path,
      fileName,
      mimeType 
    });

    await msg.update({ mediaId: newAttachment.id });

    const response = await supertest(app)
      .get(`/api/messages/${msg.id}/media`);
    
    expect(response.status).toBe(200);
    expect(response.body.fileName).toBe(fileName);
  });

  afterAll(async () => {
    await db.close()
  });
})