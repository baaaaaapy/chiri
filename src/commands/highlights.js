const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const log = require("npmlog");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("highlights")
      .setDescription("Manage your highlights")
      .addSubcommand((sbcmd) => {
        return sbcmd
            .setName("add")
            .setDescription("Create a new highlight")
            .addStringOption((o) => {
              return o
                  .setName("name")
                  .setDescription("The name of your highlight")
                  .setRequired(true);
            });
      })
      .addSubcommand((sbcmd) => {
        return sbcmd
            .setName("delete")
            .setDescription("Delete an existing highlight")
            .addStringOption((o) => {
              return o
                  .setName("name")
                  .setDescription("The name of your highlight")
                  .setRequired(true);
            });
      })
      .addSubcommand((sbcmd) => {
        return sbcmd
            .setName("clear")
            .setDescription("Delete all of your highlights");
      })
      .addSubcommand((sbcmd) => {
        return sbcmd.setName("list").setDescription("List your highlights");
      }),

  async run(interaction) {
    const embed = new MessageEmbed().setColor("#2f3136");
    const getSubcommand = interaction.options.getSubcommand();

    function sendError(error) {
      interaction.reply({
        embeds: [embed.setTitle("Error").setDescription(`${error}, silly!`)],
      });
    }

    switch (getSubcommand) {
      case "add": {
        const values = await redisClient.hGet(
            interaction.user.id,
            "highlights"
        );

        const sendSuccess = () => {
          interaction.reply({
            embeds: [
              embed
                  .setTitle("Confirmation")
                  .setDescription(
                      `Successfully created **${
                          interaction.options.get("name").value
                      }**`
                  ),
            ],
          });
        };

        if (values) {
          const splitValues = values.split(" ");

          if (!splitValues.includes(interaction.options.get("name").value)) {
            if (splitValues.length === 10) {
              sendError(
                  "You already have 10 highlights!\nIf you really want to, then you can delete some"
              );
            } else {
              await redisClient.hSet(
                  interaction.user.id,
                  "highlights",
                  `${splitValues.join(" ")} ${
                      interaction.options.get("name").value
                  }`
              );

              sendSuccess();
              await redisClient.save();
            }
          } else {
            sendError(
                `**${
                    interaction.options.get("name").value
                }** already exists for you`
            );
          }
        } else {
          await redisClient.hSet(
              interaction.user.id,
              "highlights",
              interaction.options.get("name").value
          );

          sendSuccess();
        }
        break;
      }

      case "delete": {
        const values = await redisClient.hGet(
            interaction.user.id,
            "highlights"
        );

        const sendSuccess = () => {
          interaction.reply({
            embeds: [
              embed
                  .setTitle("Confirmation")
                  .setDescription(
                      `Successfully deleted **${
                          interaction.options.get("name").value
                      }**`
                  ),
            ],
          });
        };

        if (values) {
          const splitValues = values.split(" ");

          if (splitValues.includes(interaction.options.get("name").value)) {
            if (splitValues.length === 0) {
              sendError("You have no highlights");
            } else {
              const filteredArray = splitValues.filter(
                  (k) => k !== interaction.options.get("name").value
              );

              await redisClient.hSet(
                  interaction.user.id,
                  "highlights",
                  filteredArray.join(" ")
              );

              sendSuccess();
              await redisClient.save();
            }
          } else {
            sendError(
                `**${interaction.options.get("name").value}** doesn't exist`
            );
          }
        } else {
          sendError("You have no highlights");
        }
        break;
      }

      case "clear": {
        const values = (
            await redisClient.hGet(interaction.user.id, "highlights")
        ).split(" ");
        const filter = (m) => m.user.id === interaction.user.id;

        if (values) {
          const components = new MessageActionRow().addComponents(
              new MessageButton()
                  .setCustomId("yes")
                  .setLabel("yes")
                  .setStyle("PRIMARY"),
              new MessageButton()
                  .setCustomId("no")
                  .setLabel("no")
                  .setStyle("DANGER")
          );

          interaction.reply({
            embeds: [
              embed
                  .setTitle("Confirmation")
                  .setDescription(
                      `Are you sure you'd like to clear **all** of your highlights\nRemember, this action is **not** reversible.\n\nYou have **${values.length}/10** highlights`
                  ),
            ],
            components: [components],
          });

          const collector = interaction.channel.createMessageComponentCollector(
              {filter, time: 15000, max: 1}
          );

          collector.on("collect", async (i) => {
            if (i.customId === "yes") {
              await i.deferUpdate();
              await i.editReply({
                embeds: [
                  embed
                      .setTitle("Confirmation")
                      .setDescription(
                          `Successfully wiped **${values.length}/10** highlights`
                      ),
                ],
                components: [],
              });
              await redisClient.hSet(interaction.user.id, "highlights", "");
              await redisClient.save();
            } else {
              await i.deferUpdate();
              await i.editReply({
                embeds: [
                  embed.setTitle("Confirmation").setDescription(`Nevermind...`),
                ],
                components: [],
              });
            }
          });

          collector.on("end", (collected) => {
            log.info("COLLECTOR", "Hi, I'm die");
          });
        }

        break;
      }

      case "list": {
        const values = (
            await redisClient.hGet(interaction.user.id, "highlights")
        ).split(" ");

        interaction.reply({
          embeds: [
            embed
                .setTitle(`${interaction.user.username}'s Highlights`)
                .setDescription(
                    `You have like **${values.length}/10** highlights`
                )
                .addField(
                    "☞ Highlights",
                    values.map((h) => `\`${h}\``).join(" ")
                ),
          ],
        });
      }
    }
  },
};
