import mongoose from 'mongoose'
export const connectDb = async()=>{
    const dbUri = process.env.DB_URI
    if (!dbUri) {
        throw new Error('DB_URI is not set')
    }
    try{
        await mongoose.connect(dbUri)
        console.log('db connected successfully')
    }catch(Err){
        console.error('error db connection',Err)
        throw Err
    }
}