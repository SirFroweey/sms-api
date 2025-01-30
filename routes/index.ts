import { Application } from 'express';
import messageRoutes from './messages.routes';

export default class Routes {
  constructor(app: Application) {
    app.use('/api/messages', messageRoutes);
  }
}