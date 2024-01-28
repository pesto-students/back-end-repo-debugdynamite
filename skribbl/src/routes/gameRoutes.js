// gameRoutes.js

const express = require("express");
const gameController = require("../controllers/gameController");
const authenticateTokenFromAPI = require("../middleware/apiAuthMiddleware");

const router = express.Router();

// Add a new game with multiple players
router.post("/save", authenticateTokenFromAPI, gameController.createGame);
router.get(
  "/:game_id/leaderboard",
  authenticateTokenFromAPI,
  gameController.getLeaderboard
);

module.exports = router;
