import mongoose, { Types } from "mongoose";
export interface IChat {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  lastMessageAt: Date;
}
const chatSchema = new mongoose.Schema<IChat>(
  {
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: "UserModel",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "MessageModel",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  },
);
const ChatModel = mongoose.model("chat", chatSchema);
export default ChatModel;
