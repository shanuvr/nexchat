import 'dotenv/config';
import express from 'express';
 import { createProxyMiddleware } from 'http-proxy-middleware';
import { authLimiter, generalRateLimiter } from './middleware.ts/rateLimiter';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(morgan("dev"))
app.use(generalRateLimiter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api gateway' });
});
app.use('/api/auth', authLimiter,createProxyMiddleware({target:`http://localhost:3001`,changeOrigin:true}))
app.use('/api/users', createProxyMiddleware({target:`http://localhost:3002`,changeOrigin:true}))
app.use('/api/chat', createProxyMiddleware({target:`http://localhost:3003`,changeOrigin:true}))
app.use('/api/message', createProxyMiddleware({target:`http://localhost:3004`,changeOrigin:true}))

export default app;