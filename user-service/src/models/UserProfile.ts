import mongoose from "mongoose";
interface ProfileI {
  userId: string;
  userName: string;
  avatar: string;
  bio: string;
  lastSeen: Date;
}
const ProfileSchema = new mongoose.Schema<ProfileI>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
     bio: {
      type: String,
      required: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  },
);
 const profileModel = mongoose.model('Profile',ProfileSchema)
 export default profileModel