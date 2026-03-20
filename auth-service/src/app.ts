import 'dotenv/config';
import express from 'express';
import authRouter from './routes/authRouter';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use('/',authRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Authenication Service' });
});
app.use(errorHandler)

export default app;