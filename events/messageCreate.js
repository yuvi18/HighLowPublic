//Message Create
//Whenever a message is created by a user, this bot will check that message.

const { bet, stop } = require("../game.js");

module.exports = (client, message) => {

    //Has to be with the prefix, not by a bot, and contains text.
    if(!(message.channel.type !== "GUILD_TEXT" || (message.author.bot && message.author.id !== "695664615534755850"))){
        if(message.content.startsWith(client.config.botPrefix)) {
            //Gets arguments and command
            const args = message.content.slice(client.config.botPrefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase()
            const cmd = client.commands.get(command);
            //If the command exists, run it
            if (cmd) {
                cmd.run(client, message, args);
            }
        }
        else if(message.channel.parentId === "937805422692278345"){
            if(!isNaN(message.content)){
                const amt = parseInt(message.content);
                bet(client, message, amt);
            }
            else if(message.content.toLowerCase().trim() === "stop" || message.content.toLowerCase().trim() === "pass"){
                stop(client, message);
            }
        }
    }
}