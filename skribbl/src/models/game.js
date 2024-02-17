const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  entry_fees: {
    type: Number,
    required: true,
  },
  number_of_rounds: {
    type: Number,
    required: true,
  },
  round_duration: {
    type: Number,
    required: true,
  },
  start_time: {
    type: Date,
    required: true,
  },
  scores: [
    {
      player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      points: {
        type: Number,
        default: 0,
      },
      coins: {
        type: Number,
        default: 0,
      },
      rank: {
        type: Number,
      },
    },
  ],
});

const Game = mongoose.model("Game", gameSchema);

module.exports = {
  Game,
};
