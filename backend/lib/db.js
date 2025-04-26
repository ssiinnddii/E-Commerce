import mongoose from "mongoose";

export const connectDB = async () => {
    try{
       const conn =  await mongoose.connect(process.env.MONGO_URI);
       console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch(error){
        console.log("Error connecting to MongoBD", error.message);
        process.exit(1);
        // 1 means that it has failed and 0 means success
    }
}