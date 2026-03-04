import mongoose from "mongoose";
export interface IMessage {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
}
export const MessageSchema = new mongoose.Schema<IMessage>(
  {
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "ChatModel",
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);
MessageSchema.index({ChatModel:1,createdAt:1})
const MeessageModel = mongoose.model("Meessage", MessageSchema);
export default MeessageModel;

