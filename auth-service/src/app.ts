import 'dotenv/config';
import express from 'express';
import authRouter from './routes/authRouter';

const app = express();

app.use(express.json());
app.use('/',authRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Authenication Service' });
});

export default app;