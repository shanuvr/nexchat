import express from 'express'
import { getMessages, sendMessage } from '../controllers/messageController'
const messageRouter = express.Router()
messageRouter.post('/',sendMessage)
messageRouter.get('/:chatId',getMessages)
export default messageRouter