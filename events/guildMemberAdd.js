//Guild Member Add
//Whenever a user joins the server, we will give them a starting balance.
const {playerBalance} = require("../models");

module.exports = (client, member) => {
    playerBalance.findOne({playerid: member.id})
        .then( (result) => {
            if(!result) {
                const newPlayer = new playerBalance({playerid: member.id, balance: 100});
                newPlayer.save().then(() => console.log("New player " + member.user.tag + " has been created!"));
            }
        })
        .catch((err) => console.log(err));
}