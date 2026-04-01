import amqp from 'amqplib';
import logger from './logger';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
    channel = await connection.createChannel();
    logger.info('RabbitMQ connected in Message Service');
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ in Message Service:', error);
    // Don't exit process, allow service to start so we don't get 504s, but log clearly
  }
};

export const publishEvent = async (queue: string, data: object) => {
  if (!channel) {
    logger.error(`Cannot publish to queue ${queue}: Channel not initialized`);
    return;
  }
  try {
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    logger.info(`Event published to queue: ${queue}`);
  } catch (error) {
    logger.error(`Error publishing to queue ${queue}:`, error);
  }
};