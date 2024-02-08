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

module.exports = { formatDateAndTime, getPlayerById, extractProfileUrls };
