import { connectDb } from "./src/config/db";
import app from "./src/app";
const PORT  = process.env.PORT!||4000
 connectDb().then(()=>{
    app.listen(PORT,()=>{
    console.log(`server is up and running at port ${PORT}`)
})
 })
