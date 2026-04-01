import 'dotenv/config';
import app from './app';
import { connectDb } from './config/database';
import { connectRabbitMQ } from './utils/rabbitmq';
import logger from './utils/logger';

const PORT = process.env.PORT || 3003;
const startServer = async () => {
  await connectDb();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    logger.info(`Chat Service running on port ${PORT}`);
  });
};

startServer();