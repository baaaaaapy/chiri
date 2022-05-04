const {readdirSync} = require("fs");
const log = require("npmlog");

const eventFiles = readdirSync("./src/events").filter((file) =>
    file.endsWith(".js")
);

log.info("EVENTS", `(/) Attempting to load ${eventFiles.length} events...`);

for (const file of eventFiles) {
  const event = require(`../events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.run(...args));
  } else {
    client.on(event.name, (...args) => event.run(...args));
  }

  log.info("EVENTS", `~ Loaded ${event.name}`);
}
