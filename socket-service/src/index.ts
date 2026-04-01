import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "http";
import redis from "./config/redis";
import jwt from "jsonwebtoken";
import logger from "./utils/logger";
import { connectRabbitMQ, listenToQueue } from "./events/rabbitmq";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//Redis adapter
const pubClient = new Redis(process.env.REDIS_URL as string);

const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// jwt auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Unauthorized from socket jwt"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

//connection handler
io.on("connection", async (socket) => {
  const userId = socket.data.userId;
  logger.info(`user connected : ${userId}`);

  //join room
  socket.join(`user:${userId}`);

  //typing
  // typing indicator
  socket.on(
    "typing",
    (data: { chatId: string; isTyping: boolean; receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit("user_typing", {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      });
    },
  );

  // join chat room
  socket.on("join_chat", (chatId: string) => {
    socket.join(`chat:${chatId}`);
    logger.info(`user ${userId} joined chat room: ${chatId}`);
  });

  // leave chat room
  socket.on("leave_chat", (chatId: string) => {
    socket.leave(`chat:${chatId}`);
    logger.info(`user ${userId} left chat room: ${chatId}`);
  });

  // broadcast online status to all users in same chats
socket.on('get_online_status', async (data: { userIds: string[] }) => {
  const result: Record<string, boolean> = {};
  
  for (const id of data.userIds) {
    const status = await pubClient.get(`user:online:${id}`);
    result[id] = status === '1';
  }
  
  socket.emit('online_status', result);
});


// read receipts
socket.on('read_messages', async (data: { chatId: string, senderId: string }) => {
  // notify sender that messages were read
  io.to(`user:${data.senderId}`).emit('messages_read', {
    chatId: data.chatId,
    readBy: userId
  });
});

  //set online in redis - increased expiry for stability
  await pubClient.set(`user:online:${userId}`, "1", "EX", 86400); 
  // broadcast online
  io.emit('user_online', { userId });

  //handle Disconnect
  socket.on("disconnect", async () => {
    logger.info(`user disconnected: ${userId}`);
    await pubClient.del(`user:online:${userId}`);
    // broadcast offline
    io.emit('user_offline', { userId });
  });
});

const startServer = async () => {
  await connectRabbitMQ();
  await listenToQueue("message.sent", async (data) => {
    const { message, receiverId, chatId } = data;
    //deliver to all participants in the chat room
    const targetChatId = chatId || message.chatId;
    if (targetChatId) {
      io.to(`chat:${targetChatId}`).emit(`new_message`, message);
    } else if (receiverId) {
      // Fallback for older messages or single-targeting
      io.to(`user:${receiverId}`).emit(`new_message`, message);
    }
  });

  await listenToQueue("chat.created", async (data) => {
    const { chat } = data;
    // Notify all participants about the new chat
    chat.participants.forEach((userId: string) => {
      io.to(`user:${userId}`).emit('new_chat', { chat });
    });
  });

  const PORT = process.env.PORT || 3005;
  httpServer.listen(PORT, () => {
    logger.info(`Socket service running on port ${PORT}`);
  });
};

startServer();
