import express, { Request, Response, Application } from 'express';
import serverless from 'serverless-http';
import cors, { CorsOptions } from 'cors';
import Routes from './routes';

export default class Server {
  constructor(app: Application) {
    this.config(app);
    new Routes(app);
  }

  private config(app: Application): void {
    const corsOptions: CorsOptions = {
      origin: 'http://localhost:8000'
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
}

const app: Application = express();
new Server(app);

app.get('/status', (req: Request, res: Response): Response => {
  const status = {
    'Status': 'Running'
  };
  return res.json(status);
});

const handler = serverless(app);
export { app, handler };