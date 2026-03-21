import amqp from 'amqplib';
import logger from './logger';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
  channel = await connection.createChannel();
  logger.info('RabbitMQ connected in Auth Service');
};

export const publishEvent = async (queue: string, data: object) => {
  channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
  logger.info(`Event published to queue: ${queue}`);
};