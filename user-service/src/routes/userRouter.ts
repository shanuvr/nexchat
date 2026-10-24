import express from 'express'
import { getBulkStatus, getBulkProfiles, getMyProfile, getUserStatus, searchUsers, updateAvatar, updateProfile } from '../controllers/userController'
import { upload } from '../config/multer'
const userRouter = express.Router()
userRouter.get('/profile',getMyProfile)
userRouter.put("/profile",updateProfile)
userRouter.put('/profile/avatar',upload.single("avatar"),updateAvatar)
userRouter.get('/search',searchUsers)
userRouter.post('/bulk', getBulkProfiles)
userRouter.get('/status/:userId',getUserStatus)
userRouter.get('/status/bulk',getBulkStatus)
export default userRouter