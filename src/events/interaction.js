module.exports = {
  name: "interactionCreate",
  async run(interaction) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.run(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "ono I am die",
        ephemeral: true,
      });
    }
  },
};
