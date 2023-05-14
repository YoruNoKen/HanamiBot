const { SlashCommandBuilder } = require("@discordjs/builders");
const { buildTopsEmbed } = require("../../../command-embeds/topEmbed");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUsername } = require("../../../utils/getUsernameInteraction");

async function run(interaction, username, db) {
  await interaction.deferReply();
  const mode = interaction.options.getString("mode") ?? "osu";
  const reverse = interaction.options.getBoolean("reverse") ?? false;
  let page = interaction.options.getInteger("page") ?? 1;
  const index = interaction.options.getInteger("index");
  const recent = false;

  const user = await getUser(username, mode);
  if (user.error === null) {
    interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`The user \`${username}\` was not found.`)] });
    return;
  }
  const tops = await getTops(user, mode);
  if (tops.length === 0) {
    interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No plays found for ${user.username}.`)] });
    return;
  }

  const _ = new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary).setDisabled(true);
  const _b = new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true);
  let _row = new ActionRowBuilder().addComponents(_b, _);

  const nextPage = new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary);
  const prevPage = new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary);
  let row = new ActionRowBuilder().addComponents(prevPage, nextPage.setDisabled());

  if (page === 1) {
    row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled().setDisabled(false));
  } else if (tops.length <= 5) {
    row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled(true));
  } else if (page === Math.ceil(tops.length) / 5) {
    row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
  } else if (page !== Math.ceil(tops.length) / 5) {
    row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
  }

  const embed = await buildTopsEmbed(tops, user, page, mode, index, reverse, recent, db);
  const response = await interaction.editReply({ embeds: [embed], components: [row] });

  const filter = (i) => i.user.id === interaction.user.id;
  const collector = response.createMessageComponentCollector({ time: 35000, filter: filter });

  collector.on("collect", async (i) => {
    try {
      if (i.customId == "next") {
        if (!(page + 1 > Math.ceil(tops.length) / 5)) {
          page++;
          row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage);
        }
        if (page === Math.ceil(tops.length) / 5) {
          row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
        }
        if (page !== Math.ceil(tops.length) / 5) {
          row = new ActionRowBuilder().addComponents(prevPage, nextPage);
        }

        await i.update({ content: "updating...", components: [_row] });
        const embed = await buildTopsEmbed(tops, user, page, mode, index, reverse, recent, db);
        await interaction.editReply({ content: "", embeds: [embed], components: [row] });
      } else if (i.customId == "prev") {
        if (!(0 >= page)) {
          page--;
          row = new ActionRowBuilder().addComponents(prevPage, nextPage);
        }
        if (page === Math.ceil(tops.length) / 5) {
          row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(true));
        }
        if (page !== Math.ceil(tops.length) / 5) {
          row = new ActionRowBuilder().addComponents(prevPage.setDisabled(false), nextPage.setDisabled(false));
        }
        if (page === 1) {
          row = new ActionRowBuilder().addComponents(prevPage.setDisabled(true), nextPage.setDisabled().setDisabled(false));
        }

        await i.update({ content: "updating...", components: [_row] });
        const embed = await buildTopsEmbed(tops, user, page, mode, index, reverse, recent, db);
        await interaction.editReply({ content: "", embeds: [embed], components: [row] });
      }
    } catch (e) {
      console.error(e);
    }
  });

  collector.on("end", async (i) => {
    await interaction.editReply({ components: [] });
  });
}

async function getTops(user, mode) {
  const url = `https://osu.ppy.sh/api/v2/users/${user.id}/scores/best?mode=${mode}&limit=100`;
  const headers = {
    Authorization: `Bearer ${process.env.osu_bearer_key}`,
  };
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  return await response.json();
}

async function getUser(username, mode) {
  const url = `https://osu.ppy.sh/api/v2/users/${username}/${mode}`;
  const headers = {
    Authorization: `Bearer ${process.env.osu_bearer_key}`,
  };
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  return await response.json();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Displays a user's top 100 plays specified by mode")
    .addStringOption((option) => option.setName("user").setDescription("Specify a username. (or tag someone)").setRequired(false))
    .addStringOption((option) =>
      option.setName("mode").setDescription("Select an osu! mode").setRequired(false).addChoices({ name: "standard", value: "osu" }, { name: "mania", value: "mania" }, { name: "taiko", value: "taiko" }, { name: "fruits", value: "fruits" })
    )
    .addIntegerOption((option) => option.setName("page").setDescription("The page").setMinValue(1).setMaxValue(20))
    .addIntegerOption((option) => option.setName("index").setDescription("The index of the play you want").setMinValue(1).setMaxValue(100))
    .addBooleanOption((option) => option.setName("reverse").setDescription("Whether or not to reverse the order")),
  run: async (client, interaction, db) => {
    const collection = db.collection("user_data");
    const username = await getUsername(interaction, collection);
    if (!username) return;

    await run(interaction, username, db);
  },
};