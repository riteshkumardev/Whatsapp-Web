import mongoose from "mongoose";
import "dotenv/config"; 
import { Server } from "socket.io";
import app from "./src/app.js";
import logger from "./src/configs/logger.config.js";
import SocketServer from "./src/SocketServer.js";

// Env variables
const { DATABASE_URL, CLIENT_ENDPOINT, NODE_ENV } = process.env;
const PORT = process.env.PORT || 8000;

// MongoDB Error Handling
mongoose.connection.on("error", (err) => {
  logger.error(`Mongodb connection error : ${err}`);
});

if (NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

// Database Connection function (With buffering check)
const connectDB = async () => {
  try {
    // Serverless में कनेक्शन को दोबारा इस्तेमाल करने के लिए check
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.asPromise();
    }
    await mongoose.connect(DATABASE_URL);
    logger.info("Connected to Mongodb.");
  } catch (err) {
    logger.error("Mongodb connection failed:", err);
  }
};

connectDB();

let server;

// Vercel handles the server in production
if (NODE_ENV !== "production") {
  server = app.listen(PORT, () => {
    logger.info(`Server is listening at ${PORT}.`);
  });
} else {
  // प्रोडक्शन में 'app' ही 'server' ऑब्जेक्ट की तरह काम करेगा
  server = app;
}

// Socket.io setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: CLIENT_ENDPOINT, // e.g., https://whatsappweb-gilt.vercel.app
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Vercel पर कभी-कभी custom path की ज़रूरत पड़ती है, डिफ़ॉल्ट '/socket.io' ही रहता है
});

io.on("connection", (socket) => {
  logger.info("socket io connected successfully.");
  SocketServer(socket, io);
});

// Error Handlers
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  if (NODE_ENV !== "production") process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  if (NODE_ENV !== "production") process.exit(1);
});

// Vercel requirement: Export the app
export default app;