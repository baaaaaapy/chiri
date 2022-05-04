const {Client, Intents, Collection} = require("discord.js");
const {token} = require("./config.json");
const log = require("npmlog");
const {readdirSync} = require("fs");

globalThis.client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
});

client.commands = new Collection();

for (const handler of readdirSync("./src/structures").filter((file) =>
    file.endsWith(".js")
)) {
  log.info("SETUP", `Loading ${handler}`);
  require(`./structures/${handler}`);
}

client.login(token);
