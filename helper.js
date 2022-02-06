const cards = [
    "card1.png",
    "card2.png",
    "card3.png",
    "card4.png",
    "card5.png",
    "card6.png",
    "card7.png",
    "card8.png",
    "card9.png",
    "card10.png",
    "card11.png",
    "card12.png",
    "card13.png"
]
const cardPhase = "cardPhase.png";
const bettingPhase = "bettingPhase.png";
const logo = "logo.png";

const {playerBalance, gameInfo} = require("./models.js");
const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const {updateReminder} = require("./game.js");
const resultEmbed = new MessageEmbed();

// Quelch warning that isn't correct in InteliJ
// noinspection JSCheckFunctionSignatures
const readyRow = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('redraw')
            .setLabel('Redraw!')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId('ready')
            .setLabel('Ready!')
            .setStyle('SUCCESS')
    );

exports.createGame = (client, player1, player2, message) => {
    let canCreate = true;
    //We are in promise hell.
    //Ensure Player 1 is not in a game.
    gameInfo.findOne().or([{player1: player1}, {player2: player1}])
        .then((result) => {
            if(result){
                resultEmbed
                    .setColor("#23b8f8")
                    .setTitle("Error!")
                    .setAuthor({name: "Value Bot"})
                    .setThumbnail(logo)
                    .setDescription("<@!" + player1 + "> is already in a game!")
                    .setTimestamp()
                    .setFooter({text: "Value.gg", iconURL: logo});
                message.channel.send({embeds: [resultEmbed]});
                canCreate = false;
            }
            //Ensure Player 2 is not in a game.
            gameInfo.findOne().or([{player1: player2}, {player2: player2}])
                .then((result) => {
                    if(result){
                        resultEmbed
                            .setColor("#23b8f8")
                            .setTitle("Error!")
                            .setAuthor({name: "Value Bot"})
                            .setThumbnail(logo)
                            .setDescription("<@!" + player2 + "> is already in a game!")
                            .setTimestamp()
                            .setFooter({text: "Value.gg", iconURL: logo});
                        message.channel.send({embeds: [resultEmbed]});
                        canCreate = false;
                    }
                    //Ensure Player 1 has at least 1 gem.
                    if(canCreate) {
                        playerBalance.findOne({playerid: player1})
                            .then((result) => {
                                if (result.balance < 1) {
                                    resultEmbed
                                        .setColor("#23b8f8")
                                        .setTitle("Error!")
                                        .setAuthor({name: "Value Bot"})
                                        .setThumbnail(logo)
                                        .setDescription("<@!" + player1 + "> has no gems!")
                                        .setTimestamp()
                                        .setFooter({text: "Value.gg", iconURL: logo});
                                    message.channel.send({embeds: [resultEmbed]});
                                    canCreate = false;
                                }
                                //Ensure Player 2 has at least 1 gem.
                                if(canCreate) {
                                    playerBalance.findOne({playerid: player2})
                                        .then((result) => {
                                            if (result.balance < 1) {
                                                resultEmbed
                                                    .setColor("#23b8f8")
                                                    .setTitle("Error!")
                                                    .setAuthor({name: "Value Bot"})
                                                    .setThumbnail(logo)
                                                    .setDescription("<@!" + player2 + "> has no gems!")
                                                    .setTimestamp()
                                                    .setFooter({text: "Value.gg", iconURL: logo});
                                                message.channel.send({embeds: [resultEmbed]});
                                                canCreate = false;
                                            }
                                            //Checks pass, creating game.
                                            if(canCreate) {
                                                let player1Name = client.users.cache.find(u => u.id === player1).tag;
                                                let player2Name = client.users.cache.find(u => u.id === player2).tag;
                                                player1Name = player1Name.substring(0, player1Name.length - 5);
                                                player2Name = player2Name.substring(0, player2Name.length - 5);
                                                if(player1Name.length > 4){
                                                    player1Name = player1Name.substring(0, 4);
                                                }
                                                if(player2Name.length > 4){
                                                    player2Name = player2Name.substring(0, 4);
                                                }
                                                message.guild.channels.create(player1Name + "-" + player2Name, {
                                                    type: "GUILD_TEXT",
                                                    parent: message.guild.channels.cache.find(category => category.id
                                                        === "937805422692278345")
                                                })
                                                    .then((channel) => {
                                                        //Game Category
                                                        channel.permissionOverwrites.edit(player1,{VIEW_CHANNEL : true
                                                            , SEND_MESSAGES : true, READ_MESSAGE_HISTORY: true}).then()
                                                        channel.permissionOverwrites.edit(player2,{VIEW_CHANNEL : true
                                                            , SEND_MESSAGES : true, READ_MESSAGE_HISTORY: true}).then()

                                                        //Choosing Phase
                                                        const randomID = runChoosingPhase(channel, player1, player2);

                                                        //Card Phase
                                                        runCardPhase(channel, player1, player2);

                                                        //Put Game Details in Database
                                                        const newGame = new gameInfo({
                                                            gameid: channel.id,
                                                            player1: player1,
                                                            player2: player2,
                                                            card1: 0,
                                                            card2: 0,
                                                            pot1: 1,
                                                            pot2: 1,
                                                            lastBet: 0,
                                                            betsMade: 0,
                                                            blind: 1,
                                                            player1Ready:false,
                                                            player2Ready:false,
                                                            playerTurn: randomID,
                                                            passed: false
                                                        });
                                                        newGame.save().then().catch((err) => console.log(err));
                                                        //Everything is done!
                                                        resultEmbed
                                                            .setColor("#23b8f8")
                                                            .setTitle("Game Created!")
                                                            .setAuthor({name: "Value Bot"})
                                                            .setThumbnail(logo)
                                                            .setDescription("Please find your requested game channel!")
                                                            .setTimestamp()
                                                            .setFooter({text: "Value.gg", iconURL: logo});
                                                        message.channel.send({embeds: [resultEmbed]});
                                                    });
                                            }
                                        })
                                        .catch((err) => console.log(err));
                                }
                            })
                            .catch((err) => console.log(err));
                    }
                })
        })
}

const runChoosingPhase = (channel, player1, player2) => {
    let randomID;
    if(Math.random() >= .5){
        randomID = player1;
    }
    else{
        randomID = player2;
    }
    const choosingEmbed = new MessageEmbed();
    choosingEmbed
        .setColor("#23b8f8")
        .setTitle("Card Phase")
        .setAuthor({name: "Value Bot"})
        .setThumbnail(cardPhase)
        .setDescription("The person who has been decided to bet first is:\n" +
            "<@!" + randomID + ">\n\nPlease check your private thread for your card!\nGame will start in 30 seconds" +
            " or when both players have redrawed.")
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    channel.send({embeds: [choosingEmbed]});
    return randomID;
}

const runCardPhase = (channel, player1, player2) => {
    let card1 = Math.floor(Math.random() * 13);
    let card2 = Math.floor(Math.random() * 13);

    //Player1
    channel.threads.create({
        name: "Player1 Card",
        autoArchiveDuration: 60,
        type: "GUILD_PRIVATE_THREAD",
    }).then((thread) => {
        thread.members.add(player1)
            .then(() => {
                //Give Card
                const cardEmbed = new MessageEmbed();
                cardEmbed
                    .setColor("#23b8f8")
                    .setTitle("Your Card!")
                    .setAuthor({name: "Value Bot"})
                    .setThumbnail(cardPhase)
                    .setImage(cards[card1])
                    .setDescription("Don't like your card? Click the button at the bottom of this message within " +
                        "30 seconds to redraw! Please ready otherwise.")
                    .setTimestamp()
                    .setFooter({text: "Value.gg", iconURL: logo});

                thread.send({embeds : [cardEmbed], components: [readyRow]})
                    .then((sentEmbed) => {

                        //Button Collector
                        const collector = sentEmbed.createMessageComponentCollector({ componentType: 'BUTTON', time: 30000 });

                        collector.on('collect', (i) => {
                            if(i.user.id === player1) {
                                if(i.customId === 'redraw') {
                                    card1 = Math.floor(Math.random() * 13);
                                    cardEmbed.setImage(cards[card1]);
                                }
                                //Other button is ready, so don't check for that.
                                collector.stop();
                            }
                        });

                        collector.on('end', () => {
                            cardEmbed.setDescription("");
                            sentEmbed.edit({embeds: [cardEmbed],  components: []}).then();
                            //Card has been finalized, signal that Player 1 is ready, and update their card.
                            gameInfo.findOne({gameid: channel.id})
                                .then((result) => {
                                    result.card1 = card1 + 2;
                                    result.player1Ready = true;
                                    result.save();
                                    if(result.player2Ready === true){
                                        //Both players are ready.
                                        playersReady(channel, result);
                                    }
                                })
                                .catch((err) => console.log(err));
                        });
                    });
            });
    });

    //Player 2
    channel.threads.create({
        name: "Player2 Card",
        autoArchiveDuration: 60,
        type: "GUILD_PRIVATE_THREAD",
    }).then((thread) => {
        thread.members.add(player2)
            .then(() => {
                //Give Card
                const cardEmbed = new MessageEmbed();
                cardEmbed
                    .setColor("#23b8f8")
                    .setTitle("Your Card!")
                    .setAuthor({name: "Value Bot"})
                    .setThumbnail(cardPhase)
                    .setImage(cards[card2])
                    .setDescription("Don't like your card? Click the button at the bottom of this message within " +
                        "30 seconds to redraw! Please ready otherwise.")
                    .setTimestamp()
                    .setFooter({text: "Value.gg", iconURL: logo});
                thread.send({embeds : [cardEmbed], components: [readyRow]})
                    .then((sentEmbed) => {

                        //Button Collector
                        const collector = sentEmbed.createMessageComponentCollector({ componentType: 'BUTTON', time: 30000 });

                        collector.on('collect', (i) => {
                            if(i.user.id === player2) {
                                if(i.customId === 'redraw') {
                                    card2 = Math.floor(Math.random() * 13);
                                    cardEmbed.setImage(cards[card2]);
                                }
                                //Other button is ready, so don't check for that.
                                collector.stop();
                            }
                        });

                        collector.on('end', () => {
                            cardEmbed.setDescription("");
                            sentEmbed.edit({embeds: [cardEmbed], components: []}).then();
                            //Card has been finalized, signal that Player 2 is ready, and update their card.
                            gameInfo.findOne({gameid: channel.id})
                                .then((result) => {
                                    result.card2 = card2 + 2;
                                    result.player2Ready = true;
                                    result.save();
                                    if(result.player1Ready === true){
                                        //Both players are ready.
                                        playersReady(channel, result);
                                    }
                                })
                                .catch((err) => console.log(err));
                        });
                    });
            });
    });
}

const playersReady = (channel, result) => {
    const readyEmbed = new MessageEmbed();
    readyEmbed
        .setColor("#23b8f8")
        .setTitle("Game Start")
        .setAuthor({name: "Value Bot"})
        .setThumbnail(bettingPhase)
        .setDescription("The game has now started! <@!" + result.playerTurn +
            "> will be going first.\nThe initial bet must be no lower than " + result.blind + ". To bet, simply type" +
            " the number of your bet. To stop betting, type \"stop\" or \"pass\". You have 30 seconds to make a move," +
            " or you will automatically pass.\n\nA blind of " + result.blind + " gems have been added to the pot.")
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    channel.send({embeds: [readyEmbed]});
    updateReminder(channel,result);
}