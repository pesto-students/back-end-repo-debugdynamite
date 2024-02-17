// gameController.js

const gameService = require("../services/gameService");

async function createGame(req, res) {
  try {
    const {
      code,
      entry_fees,
      number_of_rounds,
      round_duration,
      start_time,
      players,
    } = req.body;
    const newGame = await gameService.createGame(
      code,
      entry_fees,
      number_of_rounds,
      round_duration,
      start_time,
      players
    );
    res.status(201).json(newGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getLeaderboard(req, res) {
  try {
    const gameId = req.params.game_id;

    const leaderboard = await gameService.getGameLeaderboard(gameId);

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createGame,
  getLeaderboard,
};
