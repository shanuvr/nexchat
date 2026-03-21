import 'dotenv/config';
import express from 'express';
import chatRouter from './routes/chatRouter';
import { errorHandler } from './middleware/errorHandler';


const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api gateway' });
});
app.use('/',chatRouter)
app.use(errorHandler)

export default app;