require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const userRoutes = require("./src/routes/userRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const authenticateToken = require("./src/middleware/apiAuthMiddleware");
const {
  generateRoomCode,
  getRandomWords,
  computeLeaderboard,
} = require("./src/utils");

const firebaseAdmin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const { createGame } = require("./src/services/gameService");

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
const rooms = {};
const timerValue = {};
const initialScore = 1000;
const selectedUsers = {};
const selectedWords = {};
const scores = {};
const gameInfo = {};
const hostUser = {};

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
    next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
};

// Middleware to authenticate socket connections using firebase token
io.use(authenticateSocket);

let timerInterval;

const handleAutoSelectUser = (socket) => {
  const roomCode = socket.roomCode;

  // Check if there are users in the room
  if (rooms[roomCode] && rooms[roomCode].length > 0) {
    // Select the next connected user in the room
    selectedUsers[roomCode] = rooms[roomCode].shift();
    selectedUsers[roomCode].user.selected = true;
    rooms[roomCode].push(selectedUsers[roomCode]);

    // Broadcast the selected user to all connected clients
    io.to(roomCode).emit("userSelected", selectedUsers[roomCode].user);
  }
};

io.on("connection", (socket) => {
  console.log(`User ${socket.user.name} connected`);

  const selectUserAndSendWordOptions = (socket) => {
    handleAutoSelectUser(socket);
    const roomCode = socket.roomCode;
    const selectedUserSocket = rooms[roomCode].filter(
      (socket) => socket.user.uid === selectedUsers[roomCode].user.uid
    );
    if (selectedUserSocket.length > 0) {
      // console.log("word options event emitted", selectedUserSocket[0].user);
      selectedUserSocket[0].emit("wordOptions", getRandomWords());
    }
  };

  socket.on("startGame", () => {
    io.to(socket.roomCode).emit("gameStarted");
  });

  socket.on("startRound", () => {
    selectUserAndSendWordOptions(socket);
  });

  socket.on("wordSelected", (selectedWord) => {
    const roomCode = socket.roomCode;
    clearInterval(timerInterval);
    selectedWords[roomCode] = selectedWord;

    io.to(roomCode).emit("selectedWordLength", selectedWord.length);

    timerValue[roomCode] = 0;

    timerInterval = setInterval(async () => {
      timerValue[roomCode]++;

      io.to(roomCode).emit("timerUpdate", timerValue[roomCode]);

      if (timerValue[roomCode] == gameInfo[roomCode].roundDuration) {
        timerValue[roomCode] = 0;
        clearInterval(timerInterval); // Stop the timer
        if (rooms[roomCode].every((socket) => socket.user.selected)) {
          rooms[roomCode] = rooms[roomCode].map(
            (socket) => (socket.user.selected = false)
          );

          const game = await createGame(
            roomCode,
            gameInfo[roomCode].entryFees,
            1,
            gameInfo[roomCode].roundDuration,
            new Date().toISOString(),
            computeLeaderboard(scores[roomCode])
          );
          io.to(roomCode).emit("endGame", game._id);
        } else {
          io.to(roomCode).emit("scores", scores[roomCode]);
        }
      }
    }, 1000);
  });

  socket.on("selectUser", (user) => {
    io.emit("userSelected", user);
  });

  socket.on("createRoom", ({ entryFees, roundDuration, user }) => {
    const roomCode = generateRoomCode();
    hostUser[roomCode] = user;
    io.to(roomCode).emit("hostUser", user);
    socket.join(roomCode);
    gameInfo[roomCode] = { entryFees, roundDuration };
    rooms[roomCode] = [socket];
    socket.roomCode = roomCode;
    socket.emit("roomCreated", roomCode);
    scores[roomCode] = {};
    scores[roomCode][socket.user.uid] = 0;
    io.to(roomCode).emit(
      "connectedUsers",
      rooms[roomCode].map((socket) => socket.user)
    );
  });

  socket.on("validateRoomCode", (roomCode) => {
    if (rooms[roomCode]) {
      socket.emit("roomCodeValidated", gameInfo[roomCode].entryFees);
    } else {
      socket.emit("invalidRoomCode");
    }
  });

  socket.on("joinRoom", (roomCode) => {
    if (rooms[roomCode]) {
      socket.join(roomCode);
      socket.emit("roomJoined", roomCode);
      io.to(roomCode).emit("hostUser", hostUser[roomCode]);
      socket.roomCode = roomCode;
      rooms[roomCode].push(socket);
      io.to(roomCode).emit("userJoined", socket.id);
      if (!scores[roomCode].hasOwnProperty(socket.user.uid)) {
        scores[roomCode][socket.user.uid] = 0;
      }
      io.to(roomCode).emit(
        "connectedUsers",
        rooms[roomCode].map((socket) => socket.user)
      );
    } else {
      socket.emit("invalidRoomCode");
    }
  });

  // Handle messages from the client
  socket.on("message", (data) => {
    const message = {
      user: socket.user.name,
      content: data,
    };

    const roomCode = socket.roomCode;

    if (data?.toLowerCase() === selectedWords[roomCode]?.toLowerCase()) {
      scores[roomCode][socket.user.uid] =
        initialScore - timerValue[roomCode] * 5;
      message.content = `${socket.user.name} guessed the word!`;
    }

    // Broadcast the message to all connected clients
    io.to(socket.roomCode).emit("message", message);
  });

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("canvas-data", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.user.name} disconnected`);
    const roomCode = socket.roomCode;
    if (rooms && rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter(
        (user) => user.uid !== socket.user.uid
      );

      io.to(roomCode).emit(
        "connectedUsers",
        rooms[roomCode].map((socket) => socket.user)
      );
    }

    io.to(roomCode).emit("userLeft", socket.user.name);

    clearInterval(timerInterval);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
