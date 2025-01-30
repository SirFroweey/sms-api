import express, { Request, Response, Application } from 'express';
import serverless from 'serverless-http';
import Server from './server';

const app: Application = express();
new Server(app);
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

app.get('/status', (req: Request, res: Response): Response => {
  const status = {
    'Status': 'Running'
  };
  return res.json(status);
});

export const handler = serverless(app);

app
  .listen(PORT, '0.0.0.0', function () {
    console.log(`Server is running on port ${PORT}.`);
  })
  .on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log('Error: address already in use');
    } else {
      console.log(err);
    }
  });