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

// dotEnv config
dotenv.config();

const app = express();

// Morgan for logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- 1. Updated CORS Configuration ---
app.use(
  cors({
    origin: process.env.CLIENT_ENDPOINT, // Ensure this is "https://whatsappweb-gilt.vercel.app"
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- 2. Security Middlewares (Improved for Vercel/Chrome) ---
// Helmet का default config कभी-कभी cross-origin requests को ब्लॉक कर देता है
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(cookieParser());
app.use(compression());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// --- 3. Routes ---

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "WhatsApp Backend is running!" });
});

// API Routes
app.use("/api/v1", routes);

// --- 4. Error Handling ---

// 404 Error Handling
app.use(async (req, res, next) => {
  next(createHttpError.NotFound("This route does not exist."));
});

// Global Error Handling
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

export default app;