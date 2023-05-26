const { buildRecentsEmbed } = require("../../../command-embeds/recentEmbed");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUsername } = require("../../../utils/getUsernamePrefix");
const { v2 } = require("osu-api-extended");

async function run(message, username, mode, i) {
  await message.channel.sendTyping();

  let index = i ?? 1;
  const pass = 1;

  const user = await v2.user.details(username, mode);
  if (user.error === null) {
    message.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`The user \`${username}\` was not found.`)] });
    return;
  }
  const recents = await v2.scores.user.category(user.id, "recent", { include_fails: pass, limit: 100, mode: mode });
  if (recents.length === 0) {
    message.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No recent plays found for ${user.username} in osu!${mode === "osu" ? "standard" : mode}.`)] });
    return;
  }

  const _ = new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary).setDisabled(true);
  const _b = new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true);
  let _row = new ActionRowBuilder().addComponents(_b, _);

  const nextPage = new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary);
  const prevPage = new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary);
  let row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(true));

  if (index === 1) {
    if (recents.length > 1) {
      row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(false));
    }
  } else if (recents.length <= 1) {
    row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(true));
  } else if (index === recents.length) {
    row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
  } else {
    row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
  }

  const embed = await buildRecentsEmbed(recents, user, mode, index - 1);
  const response = await message.channel.send({ content: "", embeds: [embed.embed], components: [row] });

  const filter = (i) => i.user.id === message.author.id;
  const collector = response.createMessageComponentCollector({ time: 35000, filter: filter });

  collector.on("collect", async (i) => {
    try {
      if (i.customId == "next") {
        if (index + 1 < recents.length) {
          index++;
          if (index === recents.length) {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
          } else {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
          }
        }

        await i.update({ components: [_row] });
        const embed = await buildRecentsEmbed(recents, user, mode, index - 1);
        response.edit({ content: "", embeds: [embed.embed], components: [row] });
      } else if (i.customId == "prev") {
        if (!(index <= 1)) {
          index--;
          if (index === 1) {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(false));
          } else {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
          }
        }

        await i.update({ components: [_row] });
        const embed = await buildRecentsEmbed(recents, user, mode, index - 1);
        response.edit({ content: "", embeds: [embed.embed], components: [row] });
      }
    } catch (e) {}
  });

  collector.on("end", async (i) => {
    try {
      await response.edit({ components: [] });
    } catch (e) {}
  });
}

module.exports = {
  name: "recent",
  aliases: ["rs", "recent", "r", "rt", "recenttaiko", "rc", "recentfruits", "rm", "recentmania"],
  cooldown: 5000,
  run: async ({ message, args, index, commandName }) => {
    const username = await getUsername(message, args);
    if (!username) return;

    let mode = "osu";
    switch (commandName) {
      case "rt" || "recenttaiko":
        mode = "taiko";
        break;
      case "rc" || "recentfruits":
        mode = "fruits";
        break;
      case "rm" || "recentmania":
        mode = "mania";
        break;
    }

    // wanted = ["-pass", "-ps", "-passes"];
    // const passes = wanted.filter((word) => args.indexOf(word) >= 0)
    // const pass = passes[0] ?? false;

    await run(message, username, mode, index);
  },
};
