import app from './app';
import { connectDb } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;
const startServer = async()=>{
  await connectDb()
  app.listen(PORT, async() => {
    await connectDb()
    logger.info(`Chat Service running on port ${PORT}`);
  });
}

startServer()