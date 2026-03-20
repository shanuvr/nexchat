import app from './app';
import { connectDb } from './config/database';
import { connectRabbitMQ } from './utils/rabbitmq';

const PORT = process.env.PORT || 3000;
const startServer = async()=>{
  await connectDb()
  app.listen(PORT, async() => {
    await connectDb()
    await connectRabbitMQ()
    console.log(`auth Service running on port ${PORT}`);
  });
}

startServer()