import mongoose from "mongoose";
import "dotenv/config"; 

import { Server } from "socket.io";
import app from "./src/app.js";
import logger from "./src/configs/logger.config.js";
import SocketServer from "./src/SocketServer.js";

// Env variables
const { DATABASE_URL } = process.env;
const PORT = process.env.PORT || 8000;

// Exit on mongodb error
mongoose.connection.on("error", (err) => {
  logger.error(`Mongodb connection error : ${err}`);
  process.exit(1);
});

// Mongodb debug mode
if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

// Mongodb connection
mongoose.connect(DATABASE_URL).then(() => {
  logger.info("Connected to Mongodb.");
});

let server;

// Vercel handles the server in production, so app.listen is for local dev only
if (process.env.NODE_ENV !== "production") {
  server = app.listen(PORT, () => {
    logger.info(`Server is listening at ${PORT}.`);
  });
}

// Socket.io setup (Note: Vercel serverless may have issues with persistent sockets)
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_ENDPOINT,
  },
});

io.on("connection", (socket) => {
  logger.info("socket io connected successfully.");
  SocketServer(socket, io);
});

// Handle server errors
const exitHandler = () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

// SIGTERM
process.on("SIGTERM", () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  }
});

// Vercel entry point requirement
export default app;