const mongoose = require("mongoose");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");
const sanitize = require("./middleware/sanitize");
const apiRoutes = require("./routes");
const sendResponse = require("./utils/send-response");
const app = express();
if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("Please define the process.env.MONGO_URI environment variable inside your Vercel settings.");
  }

  // If a connection already exists, reuse it
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  // If a connection attempt is in progress, wait for it
  if (!global.mongooseCache.promise) {
    const opts = {
      bufferCommands: false, // Prevents hanging requests if the DB connection drops
    };

    global.mongooseCache.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => m);
  }

  try {
    global.mongooseCache.conn = await global.mongooseCache.promise;
  } catch (e) {
    global.mongooseCache.promise = null; // Reset promise on failure so it retries next time
    throw e;
  }

  return global.mongooseCache.conn;
}


app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      // Handle wildcard logic cleanly
      if (env.corsOrigin === "*") {
        return callback(null, origin); // Reflect the actual origin safely
      }

      const allowedOrigins = env.corsOrigin.split(",");
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

if (env.env === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitize);
app.use(hpp());
app.use(compression());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to ecom-bkend API.",
    docs: "/health or /api/v1/health",
  });
});

// 2. Your Health Check Route
app.get("/health", async (_req, res) => {
  try {
    // Force a connection check/attempt before inspecting readyState
    await connectToDatabase();
    
    const dbStatus = mongoose.connection.readyState;
    
    if (dbStatus !== 1) {
      return sendResponse(res, 500, "API is live, but MongoDB is disconnected.", { readyState: dbStatus });
    }

    return sendResponse(res, 200, "API and MongoDB are healthy.", { readyState: dbStatus });
  } catch (error) {
    return sendResponse(res, 500, "Health check failed.", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
