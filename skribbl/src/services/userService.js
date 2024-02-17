const { User } = require("../models/user");
const {
  formatDateAndTime,
  extractProfileUrls,
  getPlayerById,
} = require("../utils");

async function getUserDetailsById(firebase_uid) {
  try {
    const user = await User.findOne({ firebase_uid });
    if (!user) {
      throw new Error("User not found");
    }

    const userDetails = {
      user_id: user._id,
      name: user.name,
      games_played: user.games_played,
      total_money_earned: user.total_money_earned,
      wallet_balance: user.wallet_balance,
      profile_picture_url: user.profile_picture_url,
    };

    return userDetails;
  } catch (error) {
    throw error;
  }
}

const getAllUsers = async () => {
  try {
    const allUsers = await User.find();

    return allUsers;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createUser = async (user) => {
  console.log("user in service: ", user);
  try {
    const existingUser = await User.findOne({ firebase_uid: user.uid });

    if (existingUser) {
      console.log("user already exists: ", existingUser);
      return { user: existingUser, isNew: false };
    }

    const newUser = await User.create({
      name: user.displayName,
      email: user.email,
      firebase_uid: user.uid,
      profile_picture_url: user.photoURL,
    });

    console.log("new user created: ", newUser);

    return { user: newUser, isNew: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getUserRecentGames(userId, len) {
  const user = await User.findOne({ firebase_uid: userId }).populate("games");

  if (!user) {
    throw new Error("User not found");
  }

  user.games.sort((a, b) => b.start_time - a.start_time);
  const recentGames = user.games.slice(0, len);

  const response = [];
  for (const game of recentGames) {
    const scores = [];
    for (const score of game.scores) {
      const player = await User.findById(score.player_id);
      scores.push({
        player_id: {
          coins: score.coins,
          profile_url: player.profile_picture_url,
        },
      });
    }

    response.push({
      game_id: game._id,
      start_time: game.start_time,
      entry_fees: game.entry_fees,
      scores,
    });
  }

  return response.map((game) => {
    const { date, time } = formatDateAndTime(game.start_time);
    const player = getPlayerById(game.scores, user.uid);
    let money = player.coins - game.entry_fees;
    let isMoneyGained = true;
    if (money < 0) {
      isMoneyGained = false;
      money = -1 * money;
    }
    const images = extractProfileUrls(game.scores);
    return {
      game_id: game.game_id,
      date,
      time,
      money,
      is_money_gained: isMoneyGained,
      images,
    };
  });
}

module.exports = {
  getAllUsers,
  createUser,
  getUserDetailsById,
  getUserRecentGames,
};
