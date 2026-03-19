import app from './app';
import { connectDb } from './config/database';

const PORT = process.env.PORT || 3000;
const startServer = async()=>{
  await connectDb()
  app.listen(PORT, async() => {
    await connectDb()
    console.log(`auth Service running on port ${PORT}`);
  });
}

startServer()