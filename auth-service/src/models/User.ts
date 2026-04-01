import mongoose from "mongoose";
interface UserI {
  name: string;
  email: string;
  password?: string | null;   
  refreshToken?: string;
  googleId?: string;         
  avatar?: string;            
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
      required: false,
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
