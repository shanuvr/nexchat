import mongoose from "mongoose";
interface MessageI{
    chatId:string,
    senderId:string,
    text:string;
    status:"sent"| "delivered"| "reaad";
}
const messageSchema = new mongoose.Schema<MessageI>({
    chatId:{
        type:String,
        required:true
    },
    senderId:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true,
        trim:true,
    },
    status:{
        type:String,
        enum:['sent','delivered','read'],
        default:'sent'
    }
},{timestamps:true})

messageSchema.index({chatId:1, createdAt:-1})

const messageModel = mongoose.model('Message',messageSchema)
 export default messageModel