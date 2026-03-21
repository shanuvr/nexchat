import express from 'express'
import { getMyProfile, searchUsers, updateAvatar, updateProfile } from '../controllers/userController'
import { upload } from '../config/multer'
const userRouter = express.Router()
userRouter.get('/profile',getMyProfile)
userRouter.put("/profile",updateProfile)
userRouter.put('/profile/avatar',upload.single("avatar"),updateAvatar)
userRouter.get('/seaarch',searchUsers)
export default userRouter