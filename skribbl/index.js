require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const userRoutes = require("./src/routes/userRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const authenticateToken = require("./src/middleware/apiAuthMiddleware");

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account-key.json");

const mongoURI = process.env.MONGO_URI;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(express.json());

const PORT = 3001;
const connectedUsers = {};

app.use("/api/user", authenticateToken, userRoutes);
app.use("/api/game", authenticateToken, gameRoutes);

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    socket.user = decodedToken;
    // Store socket.id for each connected user
    connectedUsers[decodedToken.user_id] = {
      socketId: socket.id,
      userName: decodedToken.name,
    };
    console.log("connected users: ", connectedUsers);
    io.emit("userJoined", decodedToken.name); // Broadcast user join message
    next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
};

// Middleware to authenticate socket connections using firebase token
io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log(`User ${socket.user.name} connected`);

  io.emit("connectedUsers", connectedUsers); // Broadcast the list of connected users

  socket.on("selectUser", (user) => {
    console.log("socket selectUser: ", user);
    io.emit("userSelected", user);
  });

  // Handle messages from the client
  socket.on("message", (data) => {
    const message = {
      user: socket.user.name,
      content: data,
    };

    // Broadcast the message to all connected clients
    io.emit("message", message);
  });

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("canvas-data", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.user.name} disconnected`);
    delete connectedUsers[socket.user.user_id];
    io.emit("userLeft", socket.user.name); // Broadcast user leave message
    io.emit("connectedUsers", connectedUsers); // Broadcast the updated list of connected users
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
