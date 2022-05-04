const {createClient} = require("redis");
const log = require("npmlog");

globalThis.redisClient = createClient();

async function login() {
  redisClient.on("error", (err) => log.error("REDIS", `${err}`));

  log.info("REDIS", "Redis Client initiated");

  await redisClient.connect();

  await redisClient
      .select(0)
      .then(() => log.info("REDIS", "Logged into Database 0"));

  log.info("LOGIN", "Logged into Redis");
}

login();
