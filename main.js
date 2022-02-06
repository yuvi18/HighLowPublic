const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const mongoose = require("mongoose");

//New client
const client = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MEMBERS]});
//Attach config to client
client.config = config;

//Connects to MongoDB

mongoose.connect(config.connectString)
       .then(() => console.log("Connected to the Database!"))
       .catch((err) => console.log(err));

exports.mongoose = mongoose;

//Getting events
const events = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of events) {
  // Split the file at its extension and get the event name
  const eventName = file.split(".")[0];
  console.log(`Attempting to load event ${eventName}...`);
  const event = require(`./events/${file}`);

  // Each event will be called with the client argument
  // followed by its "normal" arguments, like message, member, etc etc.
  client.on(eventName, event.bind(null, client));
}

console.log("Events loaded!");

//Getting commands

client.commands = new Discord.Collection();
const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commands) {

  // Split the file at its extension and get the command name
  const commandName = file.split(".")[0];
  console.log(`Attempting to load command ${commandName}...`);
  const command = require(`./commands/${file}`);
  // Set the command to a collection
  client.commands.set(commandName, command);
}

console.log("Commands loaded!");

//Prints when client is ready
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

//Login to Discord
client.login(client.config.token).then();

