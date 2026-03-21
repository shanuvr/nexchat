import 'dotenv/config'
import {Server} from 'socket.io'
import { createServer } from 'http'
import redis from './config/redis'
import jwt from 'jsonwebtoken'
import logger from './utils/logger'
import { connectRabbitMQ,listenToQueue } from './events/rabbitmq'
import Redis from 'ioredis'
import { createAdapter } from '@socket.io/redis-adapter'


const httpServer = createServer();
const io = new Server(httpServer,{
  cors:{
    origin:'*',
    methods:["GET","POST"]
  }
})

//Redis adapter
 const pubClient = new Redis(process.env.REDIS_URL as string)

 const subClient = pubClient.duplicate()
 io.adapter(createAdapter(pubClient,subClient))
 
// jwt auth middleware
io.use((socket,next)=>{
  const token = socket.handshake.auth.token
  if(!token){
    return next(new Error('Unauthorized from socket jwt'))
  }

  try {
   const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    socket.data.userId = decoded.userId;
  } catch (error) {
    next(new Error('Invalid token'))
  }
})

//connection handler
io.on('connection',async(socket)=>{
  const userId = socket.data.userId
  logger.info(`user connected : ${userId}`)

    //join room
    socket.join(`user:${userId}`)

    //set online in redis
    await pubClient.set(`user:online:${userId}`,'1','EX',3600)

    //handle Disconnect
    socket.on('disconnect',async()=>{
      logger.info(`user disconnected: ${userId}`)
      await pubClient.del(`user:online:${userId}`)
    })

})

const startServer = async()=>{
  await connectRabbitMQ();
   await listenToQueue('message.sent',async(data)=>{
    const {message,receiverId} = data
     //deliver to all participants
     io.to(`user:${receiverId}`).emit(`new_message`,message)

   })
   const PORT  = process.env.PORT || 3005
 httpServer.listen(PORT, () => {
  logger.info(`Socket service running on port ${PORT}`);
})
}

startServer()