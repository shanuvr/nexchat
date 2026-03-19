import mongoose from "mongoose";

export const connectDb = async()=>{
    try {
        const uri = process.env.MONGO_URI
        if(!uri) throw new Error("mongo uri not defined")
            await mongoose.connect(uri)
            console.log("database connected in Auth Service succesfully");
            
        
    } catch (error) {
        console.log("erro connection databse",error);
        process.exit(1)
        
        
    }
    

}