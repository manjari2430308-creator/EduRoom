require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const socketIO = require("./sockets/socket");
const { startDeadlineJob } = require("./jobs/deadlineReminder");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);
socketIO(io);

connectDB().then(() => {
  startDeadlineJob();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
