const {readdirSync} = require("fs");
const log = require("npmlog");

const commandFiles = readdirSync("./src/commands").filter((file) =>
    file.endsWith(".js")
);

log.info(
    "COMMANDS",
    `(/) Attempting to load ${commandFiles.length} commands...`
);

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);

  client.commands.set(command.data.name, command);

  log.info("COMMANDS", `~ Loaded ${command.data.name}`);
}
