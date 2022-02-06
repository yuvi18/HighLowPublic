const models = require("../models.js")

exports.run = (client, message, args) => {
    if(message.member.roles.cache.some(role => role.name === "Staff")) {
        if (args.length !== 2) {
            message.channel.send("Invalid amount of arguments...");
        } else if (!message.mentions.members.first()) {
            message.channel.send("Command requires a mention...");
        }
        else if(isNaN(args[1])){
            message.channel.send("Balance must be a number...");
        }
        else {
            const playerID = args[0].substring(3, args[0].length - 1);
            const playerBalance = models.playerBalance;
            playerBalance.findOne({playerid: playerID})
                .then((result) => {
                    result.balance += parseInt(args[1]);
                    result.save();
                    message.channel.send("This amount was given to " + args[0] + "'s balance: " + args[1]);
                })
                .catch((err) => {
                    message.channel.send("Could not find player.");
                    console.log(err);
                })
        }
    }
}