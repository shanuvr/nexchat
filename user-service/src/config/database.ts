import mongoose from "mongoose";
import logger from "../utils/logger";
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        logger.info('user data base connected successfully')
        
    } catch (error) {
        logger.error(`data base connection error in user ${error}`)
        process.exit(1)
        
    }
}
export default connectDB