import express, { Request, Response, Application } from 'express';
import Server from './index';

const app: Application = express();
const server: Server = new Server(app);
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.get('/status', (req: Request, res: Response): Response => {
  const status = {
    'Status': 'Running'
  };
  return res.json(status);
});

app
  .listen(PORT, 'localhost', function () {
    console.log(`Server is running on port ${PORT}.`);
  })
  .on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log('Error: address already in use');
    } else {
      console.log(err);
    }
  });