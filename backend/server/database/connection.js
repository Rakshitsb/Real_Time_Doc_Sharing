import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Mongo connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
