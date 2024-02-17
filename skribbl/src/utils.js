const pictionaryWords = [
  "Elephant",
  "Sunflower",
  "Pizza",
  "Mountain",
  "Butterfly",
  "Guitar",
  "Sunglasses",
  "Rainbow",
  "Book",
  "Snowman",
  "Beach",
  "Robot",
  "Candle",
  "Dragon",
  "Television",
  "Bicycle",
  "Castle",
  "Cactus",
  "Clock",
  "Banana",
  "Fireworks",
  "Helicopter",
  "Moon",
  "Surfboard",
  "Train",
  "Penguin",
  "Camera",
  "Apple",
  "Carrot",
  "Tiger",
  "Lighthouse",
  "Frog",
  "Ship",
  "Rocket",
  "Star",
  "Zebra",
  "Volcano",
];

function formatDateAndTime(inputDate) {
  // Convert input string to Date object
  const dateObject = new Date(inputDate);

  // Extract date components
  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = dateObject.getDate().toString().padStart(2, "0");

  // Extract time components
  const hours = dateObject.getHours().toString().padStart(2, "0");
  const minutes = dateObject.getMinutes().toString().padStart(2, "0");

  // Determine AM or PM
  const amOrPm = hours >= 12 ? "PM" : "AM";

  // Convert 24-hour format to 12-hour format
  const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");

  // Build the final formatted object
  const formattedDateAndTime = {
    date: `${year}/${month}/${day}`,
    time: `${formattedHours}:${minutes} ${amOrPm}`,
  };

  return formattedDateAndTime;
}

function extractProfileUrls(scores) {
  const profileUrls = [];

  // Iterate through the array of player objects
  for (let i = 0; i < scores.length; i++) {
    const player = scores[i];

    // Check if profile_url exists and push it to the array
    if (player.player_id && player.player_id.profile_url) {
      profileUrls.push(player.player_id.profile_url);
    }
  }

  return profileUrls;
}

function getPlayerById(scores, playerId) {
  // Iterate through the array of player objects
  for (let i = 0; i < scores.length; i++) {
    const player = scores[i].player_id;

    // Check if player_id matches the given playerId
    if (player.player_id === playerId) {
      return player;
    }
  }

  // Return null if player with the specified player_id is not found
  return null;
}

function generateRoomCode() {
  // Generate a random 6-character alphanumeric string
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Function to randomly pick 4 words from the list
function getRandomWords() {
  const shuffledWords = pictionaryWords.sort(() => 0.5 - Math.random());
  return shuffledWords.slice(0, 4);
}

function computeLeaderboard(inputMap, totalCoins) {
  // Convert the map to an array of objects for easier manipulation
  const inputArray = Object.entries(inputMap).map(([userId, score]) => ({
    userId,
    score,
  }));

  const totalScore = inputArray.reduce((sum, data) => sum + data.score, 0);

  const calculateCoins = (score, totalCoins) => {
    return Math.round((score / totalScore) * totalCoins);
  };

  // Sort the array based on scores in descending order
  inputArray.sort((a, b) => b.score - a.score);

  // Create the transformed output object
  const transformedData = inputArray.map((data, index) => ({
    firebase_uid: data.userId,
    score: data.score,
    rank: index + 1,
    coins: calculateCoins(data.score, totalCoins),
  }));

  return transformedData;
}

module.exports = {
  formatDateAndTime,
  getPlayerById,
  extractProfileUrls,
  generateRoomCode,
  getRandomWords,
  computeLeaderboard,
};
