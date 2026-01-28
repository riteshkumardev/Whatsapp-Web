import mongoose from "mongoose";
import "dotenv/config"; 
import { Server } from "socket.io";
import app from "./src/app.js";
import logger from "./src/configs/logger.config.js";
import SocketServer from "./src/SocketServer.js";

const { DATABASE_URL } = process.env;
const PORT = process.env.PORT || 8000;

// Exit on mongodb error
mongoose.connection.on("error", (err) => {
  logger.error(`Mongodb connection error : ${err}`);
  process.exit(1);
});

// Mongodb connection
mongoose.connect(DATABASE_URL).then(() => {
  logger.info("Connected to Mongodb.");
});

let server;
// Vercel handles listen in production
if (process.env.NODE_ENV !== "production") {
  server = app.listen(PORT, () => {
    logger.info(`Server is listening at ${PORT}.`);
  });
}

// Socket setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: process.env.CLIENT_ENDPOINT },
});

io.on("connection", (socket) => {
  logger.info("socket io connected successfully.");
  SocketServer(socket, io);
});

export default app; // Vercel requirement