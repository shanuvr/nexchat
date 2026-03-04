import mongoose from 'mongoose'
export const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.DB_URI!)
        console.log('db connected successfully')
    }catch(Err){
        console.log('error db connection',Err)
        process.exit(1)
    }
}