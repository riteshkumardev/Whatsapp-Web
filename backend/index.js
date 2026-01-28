import mongoose from "mongoose";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./src/app.js";
import logger from "./src/configs/logger.config.js";
import socketHandler from "./src/SocketServer.js";

// ==============================
// ENV VARIABLES
// ==============================
const {
  DATABASE_URL,
  CLIENT_ENDPOINT,
  NODE_ENV,
  PORT = 8000,
} = process.env;

// ==============================
// MONGODB CONNECTION
// ==============================
mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

if (NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.asPromise();
    }

    await mongoose.connect(DATABASE_URL);
    logger.info("✅ Connected to MongoDB");
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);
  }
};

await connectDB();

// ==============================
// CREATE HTTP SERVER
// ==============================
const server = http.createServer(app);

// ==============================
// SOCKET.IO SETUP
// ==============================
const io = new Server(server, {
  path: "/socket.io",
  pingTimeout: 60000,
  cors: {
    origin: CLIENT_ENDPOINT, // https://whatsappweb-gilt.vercel.app
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Register socket events
socketHandler(io);

// ==============================
// START SERVER
// ==============================
if (NODE_ENV !== "production") {
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
}

// ==============================
// GLOBAL ERROR HANDLERS
// ==============================
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  if (NODE_ENV !== "production") process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  if (NODE_ENV !== "production") process.exit(1);
});

// ==============================
// EXPORT (required for Vercel)
// ==============================
export default app;
