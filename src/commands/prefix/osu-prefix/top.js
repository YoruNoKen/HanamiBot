const { buildTopsEmbed } = require("../../../command-embeds/topEmbed");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUsername } = require("../../../utils/getUsernamePrefix");
const { v2 } = require("osu-api-extended");

async function run(message, username, mode, options, i) {
  await message.channel.sendTyping();

  let index = i ?? undefined;
  let page = options.page ?? options.p ?? 1;
  const reverse = false;
  const recent = false;

  const user = await v2.user.details(username, mode);
  if (user.error === null) {
    message.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`The user \`${username}\` was not found.`)] });
    return;
  }
  const tops = await v2.scores.user.category(user.id, "best", { mode: mode, limit: 100 });
  if (tops.length === 0) {
    message.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No plays found for ${user.username} in osu!${mode === "osu" ? "standard" : mode}.`)] });
    return;
  }

  const _ = new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary).setDisabled(true);
  const _b = new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true);
  let _row = new ActionRowBuilder().addComponents(_b, _);

  const nextPage = new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary);
  const prevPage = new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary);
  let row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(true));

  if (index) {
    if (index === 1) {
      if (tops.length > 1) {
        row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(false));
      }
    } else if (tops.length <= 1) {
      row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(true));
    } else if (index === tops.length) {
      row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
    } else {
      row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
    }
  } else {
    if (page === 1) {
      if (tops.length > 5) {
        row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(false));
      }
    } else if (tops.length <= 5) {
      row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(true));
    } else if (page === Math.ceil(tops.length / 5)) {
      row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
    } else {
      row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
    }
  }

  const embed = await buildTopsEmbed(tops, user, page, mode, index, reverse, recent);
  const response = await message.channel.send({ embeds: [embed], components: [row] });

  const filter = (i) => i.user.id === message.author.id;
  const collector = response.createMessageComponentCollector({ time: 35000, filter: filter });

  collector.on("collect", async (i) => {
    try {
      if (i.customId == "next") {
        if (index && index + 1 < tops.length) {
          index++;
          if (index === tops.length) {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
          } else {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
          }
        } else if (!(page + 1 >= Math.ceil(tops.length / 5))) {
          page++;
          if (page === Math.ceil(tops.length / 5)) {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
          } else {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
          }
        }

        await i.update({ components: [_row] });
        const embed = await buildTopsEmbed(tops, user, page, mode, index, reverse, recent);
        await response.edit({ embeds: [embed], components: [row] });
      } else if (i.customId == "prev") {
        if (index && !(index <= 1)) {
          index--;
          if (index === 1) {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(false));
          } else {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
          }
        } else if (!(page <= 1)) {
          page--;
          if (page === 1) {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(false));
          } else {
            row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
          }
        }

        await i.update({ components: [_row] });
        const embed = await buildTopsEmbed(tops, user, page, mode, index, reverse, recent);
        await response.edit({ embeds: [embed], components: [row] });
      }
    } catch (e) {
      console.error(e);
    }
  });

  collector.on("end", async (i) => {
    try {
      await response.edit({ components: [] });
    } catch (e) {}
  });
}

module.exports = {
  name: "top",
  aliases: ["top", "t", "topt", "toptaiko", "topc", "topfruits", "topcatch", "topctb", "topm", "topmania"],
  cooldown: 5000,
  run: async ({ message, args, index, commandName }) => {
    const username = await getUsername(message, args);
    if (!username) return;

    let mode = "osu";
    switch (commandName) {
      case "topt":
      case "toptaiko":
        mode = "taiko";
        break;
      case "topc":
      case "topfruits":
      case "topctb":
      case "topcatch":
        mode = "fruits";
        break;
      case "topm":
      case "topmania":
        mode = "mania";
        break;
    }

    wanted = ["-p", "-page"];
    let options = [];
    wanted.forEach((word) => {
      if (args.includes(word)) {
        const key = word.replace("-", "");
        const value = args[args.indexOf(word) + 1];
        options[key] = value;
      }
    });

    await run(message, username, mode, options, index);
  },
};
