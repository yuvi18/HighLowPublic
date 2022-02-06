const server = require("./main.js");

const balanceSchema = new server.mongoose.Schema({
    playerid: {type: String, required: true},
    balance: {type: Number, required: true},
    }, {collection: 'Balances', versionKey: false});

const gameSchema = new server.mongoose.Schema({
    gameid: {type: String, required: true},
    player1:{type: String, required: true},
    player2:{type: String, required: true},
    card1:{type: Number, required: true},
    card2:{type: Number, required: true},
    pot1:{type: Number, required: true},
    pot2:{type: Number, required: true},
    blind:{type: Number, required: true},
    betsMade:{type: Number, required: true},
    lastBet:{type: Number, required: true},
    player1Ready:{type: Boolean, required: true},
    player2Ready:{type: Boolean, required: true},
    playerTurn:{type: String, required: true},
    passed:{type: Boolean, required: true}
    }, {collection: 'ActiveGames'});

exports.playerBalance = server.mongoose.model('balance', balanceSchema);
exports.gameInfo = server.mongoose.model('game', gameSchema);