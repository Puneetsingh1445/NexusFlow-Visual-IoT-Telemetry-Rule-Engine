
import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USER;
    const password = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_HOST;

    if (!username || !password || !host) {
      throw new Error("MongoDB credentials are missing in .env");
    }

    // Encode credentials safely
    const encodedUser = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);

    // Construct MongoDB URI
    const uri = `mongodb+srv://${encodedUser}:${encodedPassword}@${host}/nexusflow_db?retryWrites=true&w=majority`;

    console.log("Connecting to MongoDB...");
    console.log("Atlas host:", host);

    await mongoose.connect(uri);

    console.log("MongoDB Connected Successfully!");
    console.log("Database:", mongoose.connection.name);

  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
