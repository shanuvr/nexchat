import amqp from 'amqplib';
import logger from './logger';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
    channel = await connection.createChannel();
    logger.info('RabbitMQ connected in User Service');
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ in User Service:', error);
  }
};

export const listenToQueue = async (queue: string, callback: (data: any) => void) => {
  if (!channel) {
    logger.error(`Cannot listen to queue ${queue}: Channel not initialized`);
    return;
  }
  try {
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          callback(data);
          channel.ack(msg);
        } catch (error) {
          logger.error('Error processing RabbitMQ message:', error);
        }
      }
    });
    logger.info(`Listening to queue: ${queue}`);
  } catch (error) {
    logger.error(`Error asserting queue ${queue}:`, error);
  }
};