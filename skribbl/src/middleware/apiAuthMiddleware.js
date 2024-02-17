const admin = require("firebase-admin");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

module.exports = authenticateToken;
