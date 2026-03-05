import express from 'express'
import { protectedRoute } from '../middleware/auth'
import { callback, getMe } from '../controller/authController'
const authRouter = express.Router()
authRouter.get('/me',protectedRoute,getMe)
authRouter.post('/callback',callback)
export default authRouter