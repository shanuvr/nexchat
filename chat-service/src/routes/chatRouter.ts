import express from 'express'
import { createOrGetChat, getMyChats } from '../controllers/chatController'
const chatRouter = express.Router()
chatRouter.post('/:userId',createOrGetChat)
chatRouter.get('/',getMyChats)
export default chatRouter