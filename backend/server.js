import "dotenv/config";
import http from "http";
import { app } from "./src/app.js";
import connectDB from "./src/db/db.js";
import { connectRedis } from "./src/db/redis.js";
import { initSocket } from "./src/socket/socket.js";

// Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
initSocket(server);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    server.listen(PORT, () => {
      console.log(`Server & Socket.io running on port ${PORT}`);
    });
  } catch (error) {
    console.error("BOOTSTRAP ERROR:", error.message);
    process.exit(1);
  }
};

startServer();