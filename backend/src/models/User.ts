import mongoose, { type IsAny } from "mongoose";
interface IUser{
    clerkId:string,
    name:string,
    email:string,
    avatar:string
}
const UserSchema = new mongoose.Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);
export const UserModel = mongoose.model('User',UserSchema)
