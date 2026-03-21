import mongoose from "mongoose";
interface ChatI{
    participants:string[],
    lastMessage:string,
    lastMessageAt:Date
}
const chatSchema = new mongoose.Schema<ChatI>({
    participants:[{type:String,required:true}],
    lastMessage:String,
    lastMessageAt:{type:Date,default:Date.now()}
},{timestamps:true})

chatSchema.index({participants:1})
 const ChatModel = mongoose.model<ChatI>('Chat',chatSchema)
 export default ChatModel