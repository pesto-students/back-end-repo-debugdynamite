// gameRoutes.js

const express = require("express");
const gameController = require("../controllers/gameController");

const router = express.Router();

// Add a new game with multiple players
router.post("/", gameController.createGame);
router.get("/:game_id/leaderboard", gameController.getLeaderboard);

module.exports = router;
