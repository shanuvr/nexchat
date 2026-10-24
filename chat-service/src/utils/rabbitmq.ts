import amqp from 'amqplib';
import logger from './logger';
import ChatModel from '../models/Chat';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    logger.info('RabbitMQ connected in Chat Service');
    
    // Start consuming message.sent
    await consumeMessageSent();
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ in Chat Service', error);
  }
};

const consumeMessageSent = async () => {
  const queue = 'message.sent';
  await channel.assertQueue(queue, { durable: true });
  
  logger.info(`Listening for messages on queue: ${queue}`);
  
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        const data = JSON.parse(msg.content.toString());
        const { chatId, message } = data;
        
        if (chatId && message) {
          logger.info(`Updating last message for chat: ${chatId}`);
          
          await ChatModel.findByIdAndUpdate(chatId, {
            lastMessage: message.text,
            lastMessageAt: message.createdAt || new Date()
          });
        }
        
        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing message.sent in Chat Service', error);
        // Dont ack if it's a transient error, but for now ack to avoid loops
        channel.ack(msg);
      }
    }
  });
};

export const publishChatCreated = async (chat: any) => {
  if (!channel) return;
  const queue = 'chat.created';
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify({ chat })));
  logger.info(`Published chat.created for chat: ${chat._id}`);
};
