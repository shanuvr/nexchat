import Redis from 'ioredis'
import logger from '../utils/logger'
const redis = new Redis(process.env.REDIS_URI as string)
redis.on('connect',()=>{
    logger.info(`Redis connected in user Service`)
})
redis.on('error',(err)=>{
    logger.error(`Redis error ${err}`)
})
export default redis