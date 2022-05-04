const fs = require("node:fs");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const {token} = require("../config.json");
const log = require("npmlog");

module.exports = {
  name: "ready",
  run() {
    log.info("LOGIN", "Discord Client initiated");

    const commands = [];

    const commandFiles = fs
        .readdirSync("./src/commands")
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      commands.push(command.data.toJSON());
    }

    const rest = new REST({version: "10"}).setToken(token);

    client.guilds.cache.forEach((guild) => {
      rest
          .put(Routes.applicationGuildCommands(client.user.id, guild.id), {
            body: commands,
          })
          .then(() =>
              log.info("COMMANDS", "(/) POSTed the commands to Discord's API")
          )
          .catch(console.error);
    });
  },
};
