const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebase_uid: {
    type: "string",
    required: true,
  },
  email: {
    type: "string",
  },
  name: {
    type: String,
    required: true,
  },
  games_played: {
    type: Number,
    default: 0,
  },
  total_money_earned: {
    type: Number,
    default: 0,
  },
  wallet_balance: {
    type: Number,
    default: 0,
  },
  profile_picture_url: String,
  games: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
