import mongoose from "mongoose";

async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/akky`);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1)
    }
}

export default connectDB;
