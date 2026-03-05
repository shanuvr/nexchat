import express from 'express'
import authRouter from './routes/authRoute'
import chatRouter from './routes/chatRoute'
import userRouter from './routes/userRoutes'
import messageRouter from './routes/messageRoute'
import { clerkMiddleware } from '@clerk/express'
import { errorHandler } from './middleware/errorHandler'
const app =  express()
app.use(express.json())
app.use(clerkMiddleware())

app.get('/health',(req,res)=>{
    res.json({status:"ok"})
})

app.use('/api/auth',authRouter)
app.use('/api/chats',chatRouter)
app.use('/api/user',userRouter)
app.use('/api/message',messageRouter)
app.use(errorHandler)

 export default app