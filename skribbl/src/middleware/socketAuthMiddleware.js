// socketMiddleware.js
const firebaseAdmin = require("firebase-admin");

const authenticateSocket = (connectedUsers) => async (socket, next) => {
  const token = socket.handshake.auth.token;

  console.log("soket handshake: ", socket.handshake);

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    // Attach the decoded user information to the socket for later use
    socket.user = decodedToken;
    connectedUsers[decodedToken.user_id] = socket.id; // Store socket.id for each connected user
    console.log("connected users: ", connectedUsers);
    io.emit("userJoined", decodedToken.name); // Broadcast user join message
    next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
};

module.exports = authenticateSocket;
