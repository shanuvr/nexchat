import amqp from 'amqplib';
import logger from './logger';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
  channel = await connection.createChannel();
  logger.info('RabbitMQ connected in User Service');
};

export const listenToQueue = async (queue: string, callback: (data: any) => void) => {
  channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      callback(data);
      channel.ack(msg);
    }
  });
  logger.info(`Listening to queue: ${queue}`);
};