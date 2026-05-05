const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./database/mongoose");

let server;

const start = async () => {
  await connectDatabase();

  server = app.listen(env.port, () => {
    console.log(`Server running in ${env.env} mode on port ${env.port}`);
  });
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully.");
  if (server) server.close(() => process.exit(0));
});

start();
