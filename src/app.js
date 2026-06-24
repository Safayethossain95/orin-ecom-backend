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

app.get("/health", (_req, res) => {
  sendResponse(res, 200, "API is healthy.");
});

app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
