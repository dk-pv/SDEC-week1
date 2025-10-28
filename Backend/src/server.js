import app from "./app.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import http from "http";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], 
    methods: ["GET", "POST", "PUT"],
  },
});

connectDB();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { io };

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
