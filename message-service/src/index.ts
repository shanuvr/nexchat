import app from './app';
import { connectDb } from './config/database';
import { connectRabbitMQ } from './utils/rabbitmq';
import logger from './utils/logger';

const PORT = process.env.PORT || 3004;

async function serverStarter() {
  await connectDb()
  await connectRabbitMQ();
  app.listen(PORT, () => {
    logger.info(`Message Service running on port ${PORT}`);
  });
}

serverStarter();