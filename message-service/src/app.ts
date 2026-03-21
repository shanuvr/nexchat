import 'dotenv/config';
import express from 'express';
import messageRouter from './routes/messageRouter';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api gateway' });
});
 app.use('/',messageRouter)
 app.use(errorHandler)

export default app;