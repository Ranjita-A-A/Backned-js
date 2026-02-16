import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is runnig at PORT :${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed!!!",err)
})












/*
import express from "express"
const app = express()

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_Name}`)
        app.on('error', (error)=>{
            console.log("ERROR:",error);
            throw error;
        })

        app.listen(process.env.PORT, () =>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log(error);
        throw error
    }
})()
*/