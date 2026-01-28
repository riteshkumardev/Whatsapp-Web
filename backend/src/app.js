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

// Middlewares
app.use(helmet());
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

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_ENDPOINT || "http://localhost:3000",
    credentials: true,
  })
);

// --- मुख्य बदलाव यहाँ है ---

// 1. Root Route (Testing के लिए)
app.get("/", (req, res) => {
  res.status(200).json({ message: "WhatsApp Backend is running!" });
});

// 2. API Routes
app.use("/api/v1", routes);

// 3. 404 Error Handling
app.use(async (req, res, next) => {
  next(createHttpError.NotFound("This route does not exist."));
});

// 4. Global Error Handling
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