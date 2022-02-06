//Alias for leaderboard.js
const balance = require("./balance.js");
exports.run = (client, message, args) => {
    balance.run(client, message, args);
}