import Redis from "ioredis";
import logger from "../utils/logger";
 const redis = new Redis(process.env.REDIS_URL as string)
 redis.on('connect',()=>{
    logger.info(`Redis connected in Socket Service`)
 });

 redis.on('error',(err)=>{
    logger.error(`Redis Error ${err}`)
 })

 export default redis