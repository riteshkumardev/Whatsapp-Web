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

// Production में debug mode बंद रखें
if (NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

// Database Connection function
const connectDB = async () => {
  try {
    // serverless में कनेक्शन को मैनेज करने के लिए await ज़रूरी है
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
  // प्रोडक्शन में 'app' ही हमारा 'server' बेस बनेगा
  server = app;
}

// Socket.io setup
// पक्का करें कि origin में आपका Frontend Vercel URL है
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: CLIENT_ENDPOINT, // e.g., https://whatsappweb-gilt.vercel.app
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info("socket io connected successfully.");
  SocketServer(socket, io);
});

// Error Handlers (Cleaned)
const exitHandler = () => {
  if (server && NODE_ENV !== "production") {
    server.close(() => {
      logger.info("Server closed.");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  exitHandler();
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  exitHandler();
});

// Vercel entry point requirement
export default app;