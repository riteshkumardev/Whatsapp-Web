import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import fileUpload from "express-fileupload";
import cors from "cors";
import createHttpError from "http-errors";
import routes from "./routes/index.js";

// Load env variables
dotenv.config();

// Create express app
const app = express();

// Logger (only in dev)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Security headers
app.use(helmet());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Sanitize mongo queries
app.use(mongoSanitize());

// Cookies
app.use(cookieParser());

// Compression
app.use(compression());

// File upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_ENDPOINT,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// Handle preflight
app.options("*", cors());

// Routes
app.use("/api/v1", routes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "API running 🚀" });
});

// 404 handler
app.use((req, res, next) => {
  next(createHttpError(404, "This route does not exist."));
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    },
  });
});

export default app;
