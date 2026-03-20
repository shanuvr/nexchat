 import express from 'express'
import { login, logout, refresh, register, } from '../controllers/authController'
 const authRouter = express.Router()
 authRouter.post('/register',register)
 authRouter.post('/login',login)
 authRouter.post('/refresh',refresh)
 authRouter.post('/logout',logout)
 export default authRouter
