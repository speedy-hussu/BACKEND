import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectDB() {
  try {
    const mongoInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log("Database connected successfully:", mongoInstance.connection.host);
  } catch (error) {
    console.error("Database connection failed:", error);
    console.log(DB_NAME);
    process.exit(1); // Exit the process with failure
  }
}
export default connectDB;
