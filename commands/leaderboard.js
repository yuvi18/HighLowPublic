const { MessageEmbed } = require('discord.js');
const {playerBalance} = require("../models.js");

exports.run = (client, message) => {
    const logo = "logo.png";
    playerBalance.find().sort({"balance" : -1})
        .then((result) => {
            let leaderEmbed = new MessageEmbed();
            let currentThreshold = 1;
            let leaderBoardString = createLeaderBoardString(currentThreshold, result);
            leaderEmbed
                .setColor("#23b8f8")
                .setTitle("Top 50 Leaderboard")
                .setAuthor({name: "Value Bot"})
                .setThumbnail(logo)
                .setDescription(leaderBoardString)
                .setTimestamp()
                .setFooter({text: "Value.gg", iconURL: logo});
            message.channel.send({embeds: [leaderEmbed]})
                .then((sentEmbed) => {
                    sentEmbed.react("⬅").then();
                    sentEmbed.react("➡").then();
                    //Reaction Collector
                    const filter = (reaction, user) => {
                        return (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡') && user.id === message.author.id;
                    };

                    const collector = sentEmbed.createReactionCollector({ filter, time: 60000 });

                    collector.on('collect', (reaction, user) => {
                        if(reaction.emoji.name === '➡'){
                            currentThreshold++;
                            if(currentThreshold === 6){
                                currentThreshold = 1;
                            }
                        }
                        else{
                            currentThreshold--;
                            if(currentThreshold === 0){
                                currentThreshold = 5;
                            }
                        }
                        leaderBoardString = createLeaderBoardString(currentThreshold, result);
                        leaderEmbed.setDescription(leaderBoardString);

                        //Remove Reaction after Sent
                        const userReactions = sentEmbed.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                        for(const reaction of userReactions.values()) {
                            reaction.users.remove(user.id);
                        }

                        sentEmbed.edit({embeds: [leaderEmbed]});
                    });
                });
    })
        .catch((err) => console.log(err));
}

function createLeaderBoardString(threshold, leaderboard){
    let place = threshold * 10 - 9;
    let tempString = "Page " + threshold + "\n\n";
    while(leaderboard[place - 1] && place <= 10 * threshold){
        tempString += place + ".  <@!" + leaderboard[place - 1].playerid + ">  Balance: " + leaderboard[place-1].balance + "\n";
        place++;
    }
    return tempString;
}