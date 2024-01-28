const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateTokenFromAPI = require("../middleware/apiAuthMiddleware");

// Define routes
router.post("/save", userController.saveUser);

router.get("/all", authenticateTokenFromAPI, userController.getAllUsers);
router.get(
  "/:user_id", // firebase uid
  authenticateTokenFromAPI,
  userController.getUserDetails
);
router.get(
  "/:user_id/games", // firebase uid
  authenticateTokenFromAPI,
  userController.getRecentGames
);

module.exports = router;
