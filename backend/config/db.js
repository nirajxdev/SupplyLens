import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("FATAL: MONGO_URI is not defined. Set it in backend/.env");
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected", mongoose.connection.host);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error?.message || error);
        // Fail fast — don't start a server that can't serve requests
        process.exit(1);
    }
}