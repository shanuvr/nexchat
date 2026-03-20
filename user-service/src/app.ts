import 'dotenv/config';
import express from 'express';
import userRouter from './routes/userRouter';
import { errorHandler } from './middleware/errorHandler';
import morgan from 'morgan'

const app = express();

app.use(express.json());
app.use(morgan("dev"))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'User Service' });
});
app.use('/',userRouter)
app.use(errorHandler)

export default app;