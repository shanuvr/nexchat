import express from 'express'
import { createOrGetChat, getChatById, getMyChats } from '../controllers/chatController'
const chatRouter = express.Router()
chatRouter.post('/:userId',createOrGetChat)
chatRouter.get('/',getMyChats)
chatRouter.get('/:id', getChatById)
export default chatRouter