import 'dotenv/config';
import app from './app';
import connectDB from './config/database';
import profileModel from './models/UserProfile';
import logger from './utils/logger';
import { connectRabbitMQ, listenToQueue } from './utils/rabbitmq';

const PORT = process.env.PORT || 3002;
async function serverStarter() {
 await connectDB()
 await connectRabbitMQ()
  await listenToQueue('user.registered',async(data)=>{
    try {
      await profileModel.create({
        userId:data.userId,
        userName:data.email.split('@')[0],
        avatar:"",
        bio:""
      })
      logger.info(`profile created for user ${data.userId}`)
      
    } catch (error) {
      logger.error(`failed to create profile ${error}`)
      
    }
  })
 app.listen(PORT, () => {
  logger.info(`user Service running on port ${PORT}`);
});
  
}
 serverStarter()