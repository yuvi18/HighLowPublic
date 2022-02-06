const { MessageEmbed } = require('discord.js');

exports.run = (client, message, args) => {
    const helpEmbed = new MessageEmbed();
    //If there are no args, send default help. Else, send specific help.
    if(!args[0]){
        const logo = "logo.png"
        helpEmbed
            .setColor("#23b8f8")
            .setTitle("Help")
            .setAuthor({name: "Value Bot"})
            .setThumbnail(logo)
            .setDescription("Welcome to the help page! Unfortunately, there is nothing here yet!")
            .setTimestamp()
            .setFooter({text: "Value.gg", iconURL: logo});
    }
    message.channel.send({embeds: [helpEmbed]});
}