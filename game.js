const {playerBalance, gameInfo} = require("./models.js");
const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const choosingPhase = "choosingPhase.png";
const bettingPhase = "bettingPhase.png";
const sameCard = "sameCard.png";
const logo = "logo.png";
let autoPass, betTimeout;
// Quelch warning that isn't correct in InteliJ
// noinspection JSCheckFunctionSignatures

const highLowRow = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('high')
            .setLabel('High')
            .setStyle('SUCCESS'),
        new MessageButton()
            .setCustomId('low')
            .setLabel('Low')
            .setStyle('DANGER')
    );

exports.stop = (client, message) => {
    //Error Checking
    gameInfo.findOne({gameid: message.channel.id})
        .then((result) => {
            if(result.passed === true){
                errorMessage(message, "Already Passed!");
            }
            else if(result.player1Ready === false || result.player2Ready === false){
                errorMessage(message, "Game hasn't started yet!");
            }
            else{
                if(result.playerTurn !== message.author.id){
                    errorMessage(message, "It isn't your turn yet!");
                }
                else{
                    //Stop reminders and check who wins!
                    result.passed = true;
                    result.save();
                    clearTimeout(betTimeout);
                    clearTimeout(autoPass);
                    highLowMessage(message, result)
                }
            }
        }).catch((err) => console.log(err))
}

exports.bet = (client, message, amt) => {
    //Error Checking
    playerBalance.findOne({playerid: message.author.id})
        .then((resultBal) => {
                gameInfo.findOne({gameid: message.channel.id})
                    .then((result) => {
                        let pot;
                        if(message.author.id === result.player1){
                            pot = result.pot1;
                        }
                        else{
                            pot = result.pot2;
                        }
                        if(result.player1Ready === false || result.player2Ready === false){
                            errorMessage(message, "Game hasn't started yet!");
                        }
                        else{
                            if(result.playerTurn !== message.author.id){
                                errorMessage(message, "It isn't your turn yet!");
                            }
                            else{
                                //If Initial Blind, must be higher than blind
                                if(result.betsMade === 0 && amt < result.blind){
                                    errorMessage(message, "Initial bet must be at least the blind!");
                                }
                                else if(amt <= result.lastBet){
                                    errorMessage(message, "Bet must be higher than the last one!");
                                }
                                else if(!(resultBal.balance >= amt + pot)){
                                    errorMessage(message, "You don't have that many gems!\n");
                                }
                                else{
                                    //Passed Error Checking, Send Bet
                                    sendBet(message, amt, result);
                                }
                            }
                        }
                    }).catch((err) => console.log(err))
        }).catch((err) => console.log(err));
}

const sendBet = (message, amt, result) => {
    const betEmbed = new MessageEmbed();
    result.betsMade++;
    const betNumber = result.betsMade;
    result.lastBet = amt;
    if(message.author.id === result.player1){
        result.pot1 += amt;
        result.playerTurn = result.player2;
    }
    else{
        result.pot2 += amt;
        result.playerTurn = result.player1;
    }
    result.save();
    exports.updateReminder(message.channel, result);
    const totalPot = result.pot1 + result.pot2;
    betEmbed
        .setColor("#23b8f8")
        .setTitle("Bet #" + betNumber)
        .setAuthor({name: "Value Bot"})
        .setThumbnail(bettingPhase)
        .setDescription("<@!" + message.author.id + "> has just bet " + amt + "!\n\n" +
            "Current Pot Totals:\n<@!" + result.player1 + ">: " + result.pot1 + "\n<@!" +
            result.player2 + ">: " + result.pot2 + "\n\n**Total Pot:** " + totalPot +
            "\n\n***Bet a higher amount, or pass.***")
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    message.channel.send({embeds: [betEmbed]});
}

const errorMessage = (message, text) => {
    const errorEmbed = new MessageEmbed();
    errorEmbed
        .setColor("#23b8f8")
        .setTitle("Error!")
        .setAuthor({name: "Value Bot"})
        .setThumbnail(bettingPhase)
        .setDescription(text)
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    message.channel.send({embeds: [errorEmbed]});
}

const highLowMessage = (message, result) => {
    let stopper, priority;
    if(message.author.id === result.player1){
        stopper = result.player1;
        priority = result.player2;
    }
    else{
        stopper = result.player2;
        priority = result.player1;
    }
    const highLowEmbed = new MessageEmbed();
    highLowEmbed
        .setColor("#23b8f8")
        .setTitle("Betting Stopped!")
        .setAuthor({name: "Value Bot"})
        .setThumbnail(choosingPhase)
        .setDescription("<@!" + stopper + "> has passed!\n\n" +
            "<@!" + priority + ">, guess if your card is higher or lower. Your answer will randomly be" +
            " chosen if you do not respond within 1 minute.")
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    runHighLow(message.channel, highLowEmbed, result, stopper, priority);
}

const determineWinner = (channel, high, result, stopper, priority) => {
    const pot = result.pot1 + result.pot2;
    let guesserCard, stopperCard, guesserPot, stopperPot;
    if(priority === result.player1){
        guesserCard = result.card1;
        stopperCard = result.card2;
        guesserPot = result.pot1;
        stopperPot = result.pot2;
    }
    else{
        guesserCard = result.card2;
        stopperCard = result.card1;
        guesserPot = result.pot2;
        stopperPot = result.pot1;
    }
    if(guesserCard === stopperCard){
        //Yikes! Same Card Rule.
        declareWinner(channel, "Yikes! You and <@!" + stopper + "> had the same card!\n\n" +
            "By the same card rule, <@!" + stopper + "> wins " + pot + " gems!", high)

        removeFromPlayer(priority, guesserPot);
        giveToPlayer(stopper, guesserPot);
    }
    else if((guesserCard > stopperCard && high)  || (guesserCard < stopperCard && !high)){
        //Winner!
        let msgPart1;
        if(!high){
            msgPart1 = "Congraulations, <@!" + priority + "> had the lower card!\n\n";
        }
        else{
            msgPart1 = "Congraulations, <@!" + priority + "> had the higher card!\n\n";
        }
        declareWinner(channel,  msgPart1 +
            "<@!" + priority + "> wins " + pot + " gems!", high);

        giveToPlayer(priority, stopperPot);
        removeFromPlayer(stopper, stopperPot);
    }
    else{
        //Loser!
        let msgPart1;
        if(high){
            msgPart1 = "Sorry, <@!" + stopper + "> had the higher card!\n\n";
        }
        else{
            msgPart1 = "Sorry, <@!" + stopper + "> had the lower card!\n\n";
        }
        declareWinner(channel,  msgPart1 +
            "<@!" + stopper + "> wins " + pot + " gems!", high);

        removeFromPlayer(priority, guesserPot);
        giveToPlayer(stopper, guesserPot);
    }

    const cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
    const cardEmbed = new MessageEmbed();
    cardEmbed
        .setColor("#23b8f8")
        .setTitle("Player Cards")
        .setAuthor({name: "Value Bot"})
        .setThumbnail(logo)
        .setDescription("The cards in play were:\n\n<@!" + result.player1 + ">: " + cards[result.card1-2] + "\n" +
            "<@!" + result.player2 + ">: " + cards[result.card2-2])
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    channel.send({embeds: [cardEmbed]});

    endGame(channel);

}

const declareWinner = (channel, text, high) => {
    const winnerEmbed = new MessageEmbed();
    let title;
    if(high){
        title = "Guessed High!"
    }
    else{
        title = "Guessed Low!"
    }
    winnerEmbed
        .setColor("#ee93fd")
        .setTitle(title)
        .setAuthor({name: "Value Bot"})
        .setThumbnail(sameCard)
        .setDescription(text)
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    channel.send({embeds : [winnerEmbed]});
}

const removeFromPlayer = (playerID, amt) =>{
    playerBalance.findOne({playerid: playerID})
        .then((result) => {
            result.balance -= parseInt(amt);
            result.save();
        })
        .catch((err) => {
            console.log(err);
        })
}

const giveToPlayer = (playerID, amt) =>{
    playerBalance.findOne({playerid: playerID})
        .then((result) => {
            result.balance += parseInt(amt);
            result.save();
        })
        .catch((err) => {
            console.log(err);
        })
}

const endGame = (channel) => {
    const endEmbed = new MessageEmbed();
    endEmbed
        .setColor("#23b8f8")
        .setTitle("Thanks for playing!")
        .setAuthor({name: "Value Bot"})
        .setThumbnail(logo)
        .setDescription("This channel will remain open for 15 seconds.")
        .setTimestamp()
        .setFooter({text: "Value.gg", iconURL: logo});
    channel.send({embeds: [endEmbed]})
        .then(() => {
            //Delete Game and Channel From Database
            gameInfo.deleteOne({gameid: channel.id}).then(() => {}).catch((err) => console.log(err));
            setTimeout(() => {channel.delete()}, 15000)
        }).catch((err) => console.log(err));
}

exports.updateReminder = (channel, result) => {
    if(betTimeout){
        clearTimeout(betTimeout);
    }
    betTimeout = setTimeout(() => {channel.send("<@!" + result.playerTurn +
        "> You have 15 seconds!")}, 15000);
    if(autoPass){
        clearTimeout(autoPass);
    }
    autoPass = setTimeout(() => {
        const passEmbed = new MessageEmbed();
        let stopper, priority;
        if(result.playerTurn === result.player1){
            stopper = result.player1;
            priority = result.player2;
        }
        else{
            stopper = result.player2;
            priority = result.player1;
        }
        result.passed = true;
        result.save();
        passEmbed
            .setColor("#23b8f8")
            .setTitle("Betting Stopped!")
            .setAuthor({name: "Value Bot"})
            .setThumbnail(choosingPhase)
            .setDescription("<@!" + stopper + "> has automatically passed!\n\n" +
                "<@!" + priority + ">, guess if your card is higher or lower. Your answer will randomly be" +
                " chosen if you do not respond within 1 minute.")
            .setTimestamp()
            .setFooter({text: "Value.gg", iconURL: logo});
        runHighLow(channel, passEmbed, result, stopper, priority);
    }, 30000);
}

const runHighLow = (channel, highLowEmbed, result, stopper, priority) => {
    channel.send({embeds : [highLowEmbed], components: [highLowRow]})
        .then((sentEmbed) => {

            const collector = sentEmbed.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });
            let high;

            const highLowReminder = setTimeout(() => {channel.send("<@!" + priority +
                "> You have 15 seconds!")}, 45000)

            collector.on('collect', (i) => {
                if(i.user.id === priority) {
                    high = i.customId === 'high';
                    collector.stop("Chose");
                }
            });

            collector.on('end', (collected, reason) => {

                if(reason !== "Chose") {
                    high = Math.random() >= .5;
                }

                //High / Low has been Chosen
                sentEmbed.edit({components: []});
                //Clear Timer
                clearTimeout(highLowReminder);
                determineWinner(channel, high, result, stopper, priority)
            });
        }).catch((err) => console.log(err));
}