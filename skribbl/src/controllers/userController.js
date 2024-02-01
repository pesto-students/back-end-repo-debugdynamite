const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

async function getUserDetailsById(req, res) {
  try {
    const userId = req.params.user_id;
    const userDetails = await userService.getUserDetailsById(userId);
    res.status(200).json(userDetails);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "User not found" });
  }
}

const createUser = (req, res) => {
  try {
    const { user, isNew } = userService.createUser(req.body);
    if (isNew) {
      res.status(201).json(user);
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    res.status(500).json(error);
  }
};

async function getRecentGames(req, res) {
  try {
    const userId = req.params.user_id;
    const len = parseInt(req.query.len) || Number.MAX_SAFE_INTEGER;

    const recentGames = await userService.getUserRecentGames(userId, len);

    res.json(recentGames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  getUserDetailsById,
  getRecentGames,
};
