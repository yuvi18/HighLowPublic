const { MessageEmbed } = require('discord.js');
const {createGame} = require("../helper.js");
const logo = "logo.png";

exports.run = (client, message) => {
    let duelEmbed = new MessageEmbed();
    if(!message.mentions.members.first()){
        duelEmbed
            .setColor("#23b8f8")
            .setTitle("Error!")
            .setAuthor({name: "Value Bot"})
            .setThumbnail(logo)
            .setDescription("You must mention a user when using this command!")
            .setTimestamp()
            .setFooter({text: "Value.gg", iconURL: logo});
        message.channel.send({embeds: [duelEmbed]})
        return;
    }
    else if(message.mentions.members.first().id === message.author.id){
        duelEmbed
            .setColor("#23b8f8")
            .setTitle("Error!")
            .setAuthor({name: "Value Bot"})
            .setThumbnail(logo)
            .setDescription("You can't duel yourself!")
            .setTimestamp()
            .setFooter({text: "Value.gg", iconURL: logo});
        message.channel.send({embeds: [duelEmbed]})
        return;
    }
    duelEmbed
        .setColor("#23b8f8")
        .setTitle("Duel Challenge!")
        .setAuthor({name: "Value Bot"})
        .setThumbnail(logo)
        .setDescription("<@!" + message.author.id + "> has challenged you to duel!\n\n" +
            "React with ✅ to accept this duel!\nChallenge will expire in 5 minutes.")
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    message.channel.send({embeds: [duelEmbed]})
        .then((sentEmbed) => {
            sentEmbed.react("✅").then();

            //Reaction Collector
            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅' && user.id === message.mentions.members.first().id;
            };

            const collector = sentEmbed.createReactionCollector({ filter, time: 300000 });

            collector.on('collect', () => {
                duelEmbed.setDescription("Challenge accepted! Creating your channels now...");
                duelEmbed.setColor("#0eb936");
                sentEmbed.edit({embeds: [duelEmbed]});
                createGame(client, message.author.id, message.mentions.members.first().id, message);
                collector.stop("Duel Accepted");
            });
            collector.on('end', (collected, reason) => {
                if(reason !== "Duel Accepted") {
                    duelEmbed.setDescription("Challenge has expired... make a new one to try again.");
                    duelEmbed.setColor("#e11010")
                    sentEmbed.edit({embeds: [duelEmbed]});
                }
            });
        })
        .catch((err) => console.log(err));
}
