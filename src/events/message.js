const log = require("npmlog");

module.exports = {
  name: "messageCreate",
  async run(message) {
    if (message.author.bot) return;

    const funnyUsers = [];

    const keys = await redisClient.keys("*");

    for (const key of keys) {
      const hash = await redisClient.hGet(key, "highlights");
      const hashArray = hash.split(" ");
      funnyUsers.push({id: key, highlights: hashArray});
    }

    // Words coming from the Database
    const words = [];
    // End words
    const words2 = [];

    // Getting all the highlights
    funnyUsers.forEach((w) => {
      w.highlights.forEach((wa) => {
        words.push(wa);
      });
    });

    // Array of end users
    const elUsers = [];

    // Array of the message strings
    const funnyMessage = message.content.split(" ");

    // Strings to end words
    funnyMessage.forEach((word) => {
      if (words.includes(word) && !words2.includes(word)) {
        words2.push(word);
      }
    });

    // Pushing to the end users
    words2.forEach((word) => {
      funnyUsers
          .filter((wordbird) => wordbird.highlights.includes(word))
          .forEach((user) => {
            if (!elUsers.includes(user.id)) {
              elUsers.push(user.id);
            }
          });
    });

    // message.channel.send(`test ${elUsers.map((u) => `<@!${u}>`)}`);

    if (words2.length > 0) {
      elUsers.forEach((user) => {
        client.users.fetch(user).then((u) => {
          u.send(
              `**Highlight found!**\n"${message.content}" - ${message.author}\n${message.channel} - ${message.url}`
          ).catch(() => log.info("DIRECT MESSAGE", "I couldn't DM the user"));
        });
      });
    }
  },
};
