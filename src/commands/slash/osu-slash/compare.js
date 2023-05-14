const { buildCompareEmbed } = require("../../../command-embeds/compareEmbed");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { getUsername } = require("../../../utils/getUsernameInteraction");

async function run(interaction, username, db, client) {
  await interaction.deferReply();

  GoodToGo = false;
  EmbedValue = 0;

  const index = interaction.options.getInteger("index") ?? undefined;
  const page = 1;
  const reverse = interaction.options.getBoolean("reverse") ?? false;
  const mode = interaction.options.getString("mode") ?? "osu";

  const now = Date.now();
  const beatmapID = await cycleThroughEmbeds(client, interaction);
  if (!beatmapID) {
    interaction.reply({ content: "No embeds found in the last 100 messages.", ephemeral: true });
    return;
  }
  console.log(`found ID in ${Date.now() - now}ms`);

  const now2 = Date.now();
  const user = await getUser(username, mode);
  console.log(`Fetched user in ${Date.now() - now2}ms`);
  if (user.error === null) {
    interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`The user \`${username}\` was not found.`)] });
    return;
  }

  const now3 = Date.now();
  const beatmap = await getMap(beatmapID);
  if (!beatmap) {
    interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`Beatmap doesn't exist. check if you replied to a beatmapset.`)] });
    return;
  }
  console.log(`Fetched beatmap in ${Date.now() - now3}ms`);

  const now4 = Date.now();
  const scores = await getScores(user, beatmapID);
  if (scores.scores.length === 0) {
    interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No plays found for ${user.username}. Skill issue.`)] });
    return;
  }
  console.log(`Fetched scores in ${Date.now() - now4}ms`);

  const now5 = Date.now();
  const embed = await buildCompareEmbed(scores.scores, user, page, mode, index, reverse, db, beatmap);
  console.log(`Fetched embed in ${Date.now() - now5}ms`);

  interaction.editReply({ embeds: [embed] });
}

async function getScores(user, beatmapID) {
  const url = `https://osu.ppy.sh/api/v2/beatmaps/${beatmapID}/scores/users/${user.id}/all`;
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

async function getMap(beatmapID) {
  const url = `https://osu.ppy.sh/api/v2/beatmaps/${beatmapID}`;
  const headers = {
    Authorization: `Bearer ${process.env.osu_bearer_key}`,
  };
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  return await response.json();
}

function findID(embed) {
  const regex = /^https?:\/\/osu\.ppy\.sh\/(b|beatmaps)\/\d+$/;
  let beatmapIDFound = false;

  let beatmapID;
  if (embed.url) {
    if (regex.test(embed.url)) {
      beatmapID = embed.url.match(/\d+/)[0];
      if (beatmapID !== undefined) {
        beatmapIDFound = true;
        GoodToGo = true;
      }
    }
  }

  if (beatmapIDFound === false && embed.description) {
    if (regex.test(embed.description)) {
      beatmapID = embed.description.match(/\d+/)[0];
      if (beatmapID !== undefined) {
        beatmapIDFound = true;
        GoodToGo = true;
      }
    }
  }

  if (beatmapIDFound === false && embed.author?.url) {
    if (regex.test(embed.author?.url)) {
      beatmapID = embed.author?.url.match(/\d+/)[0];
      if (beatmapID !== undefined) {
        beatmapIDFound = true;
        GoodToGo = true;
      }
    }
  }

  if (!beatmapIDFound) {
    EmbedValue++;
    GoodToGo = false;
    return false;
  }
  return beatmapID;
}

async function cycleThroughEmbeds(client, interaction) {
  const channel = client.channels.cache.get(interaction.channelId);
  const messages = await channel.messages.fetch({ limit: 100 });

  for (const [id, message] of messages) {
    if (message.embeds.length > 0 && message.author.bot) {
      const embed = message.embeds[0];
      beatmapID = await findID(embed);
      if (beatmapID) {
        break;
      }
    }
  }
  return beatmapID;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compare")
    .setDescription("Displays a user's best score(s) on a beatmap")
    .addStringOption((option) => option.setName("user").setDescription("Specify a username. (or tag someone)").setRequired(false))
    .addStringOption((option) =>
      option.setName("mode").setDescription("Select an osu! mode").setRequired(false).addChoices({ name: "standard", value: "osu" }, { name: "mania", value: "mania" }, { name: "taiko", value: "taiko" }, { name: "fruits", value: "fruits" })
    )
    .addIntegerOption((option) => option.setName("index").setDescription("The index of a recent play.").setMinValue(1).setMaxValue(50))
    .addBooleanOption((option) => option.setName("reverse").setDescription("Select if pp order should be reversed"))
    .addStringOption((option) => option.setName("mods").setDescription("Specify what mods to consider.")),
  run: async (client, interaction, db) => {
    const collection = db.collection("user_data");
    const username = await getUsername(interaction, collection);
    if (!username) return;

    await run(interaction, username, db, client);
  },
};