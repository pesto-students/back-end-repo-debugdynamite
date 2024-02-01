// gameService.js

const { Game } = require("../models/game");
const { User } = require("../models/user");

async function createGame(
  code,
  entry_fees,
  number_of_rounds,
  round_duration,
  start_time,
  players
) {
  const gameScores = [];

  // Iterate through the players array and create the scores
  for (const player of players) {
    const { firebase_uid, score, coins, rank } = player;

    // Check if the user exists
    const user = await User.findOne({ firebase_uid });
    if (!user) {
      throw new Error(`User with firebase_uid ${firebase_uid} not found`);
    }

    gameScores.push({
      player_id: user._id,
      points: score,
      coins,
      rank,
    });

    // Update user fields
    user.total_money_earned += coins;
    user.wallet_balance += coins;
    user.games_played += 1;

    await user.save();
  }

  // Create a new game
  const newGame = await Game.create({
    code,
    entry_fees,
    number_of_rounds,
    round_duration,
    start_time,
    scores: gameScores,
  });

  // Update the users' recent games
  for (const player of players) {
    const { firebase_uid } = player;
    const user = await User.findOne({ firebase_uid });
    user.games.push(newGame._id);
    await user.save();
  }

  return newGame;
}

async function getGameLeaderboard(gameId) {
  const game = await Game.findById(gameId).populate("scores.player_id");

  if (!game) {
    throw new Error("Game not found");
  }

  const leaderboard = {
    game_id: game._id,
    entry_fees: game.entry_fees,
    players_info: [],
  };

  for (const score of game.scores) {
    const player = score.player_id;

    leaderboard.players_info.push({
      player_id: player.firebase_uid,
      name: player.name,
      profile_url: player.profile_picture_url,
      games_played: player.games_played,
      points: score.points,
      coins: score.coins,
      rank: score.rank,
    });
  }

  return leaderboard;
}

module.exports = {
  createGame,
  getGameLeaderboard,
};
