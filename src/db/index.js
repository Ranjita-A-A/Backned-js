import mongoose from "mongoose"
import { DB_Name } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL} / ${DB_Name}`)
        console.log(`\nMongoDB connected!! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error ",error);
        process.exit(1)
    }
}

export default connectDB