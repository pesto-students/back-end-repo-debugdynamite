const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Define routes
router.post("/", userController.createUser);

router.get("/", userController.getAllUsers);
router.get(
  "/:user_id", // firebase uid
  userController.getUserDetailsById
);
router.get(
  "/:user_id/games", // firebase uid
  userController.getRecentGames
);

module.exports = router;
