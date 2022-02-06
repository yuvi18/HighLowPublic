const { MessageEmbed } = require('discord.js');
const models = require("../models.js")
exports.run = (client, message, args) => {
    const balanceEmbed = new MessageEmbed();
    const logo = "logo.png";
    if(args.length > 0){
        if(message.member.roles.cache.some(role => role.name === "Staff")) {
            if(message.mentions.members.first()){
                const balanceEmbed = new MessageEmbed();
                const playerID = args[0].substring(3, args[0].length - 1);
                let balance;
                let userAvatar = message.mentions.members.first().displayAvatarURL({format: "jpg"});
                const playerBalance = models.playerBalance;
                playerBalance.findOne({playerid: playerID})
                    .then((result) => {
                        balance = result.balance;
                        playerBalance.find({balance: {$gt : balance}}).count()
                            .then((position) =>{
                                position += 1;
                                balanceEmbed
                                    .setColor("#23b8f8")
                                    .setTitle("Balance")
                                    .setAuthor({name: "Value Bot"})
                                    .setThumbnail(userAvatar)
                                    .setDescription("Player's balance is:   " + balance + "\n\nLeaderboard position:   " + position)
                                    .setTimestamp()
                                    .setFooter({text: "Value.gg", iconURL: logo});
                                message.channel.send({embeds: [balanceEmbed]});
                            });

                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }
            else{
                message.channel.send("Command requires a mention...");
            }
        }
    }
    else {
        const authorID = message.author.id;
        let balance;
        let userAvatar = message.author.displayAvatarURL({format: "jpg"});
        const playerBalance = models.playerBalance;
        playerBalance.findOne({playerid: authorID})
            .then((result) => {
                balance = result.balance;
                playerBalance.find({balance: {$gt : balance}}).count()
                    .then((position) =>{
                        position += 1;
                        balanceEmbed
                            .setColor("#23b8f8")
                            .setTitle("Balance")
                            .setAuthor({name: "Value Bot"})
                            .setThumbnail(userAvatar)
                            .setDescription("Your balance is:   " + balance + "\n\nLeaderboard position:   " + position)
                            .setTimestamp()
                            .setFooter({text: "Value.gg", iconURL: logo});
                        message.channel.send({embeds: [balanceEmbed]});
                    });
            })
            .catch((err) => {
                console.log(err);
            })
    }
}