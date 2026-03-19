import mongoose from "mongoose";
interface UserI {
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
}

const userSchema = new mongoose.Schema<UserI>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique:true
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
