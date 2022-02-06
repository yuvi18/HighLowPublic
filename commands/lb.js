//Alias for leaderboard.js
const leaderboard = require("./leaderboard.js");
exports.run = (client, message, args) => {
    leaderboard.run(client, message, args);
}