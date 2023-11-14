import { getUsernameFromArgs, Interactionhandler, showMoreButton, getBeatmapId_FromContext, getMap, downloadMap, insertData, getPerformanceDetails, rulesets } from "../utils";
import { Message, ChatInputCommandInteraction, EmbedBuilder, ButtonInteraction, Client } from "discord.js";
import { BeatmapDetails } from "../classes";
import { v2 } from "osu-api-extended";

export async function start({ interaction, client, args }: { interaction: Message<boolean>; client: Client<boolean>; args: string[] }) {
  const options = Interactionhandler(interaction, args);

  const userOptions = getUsernameFromArgs(options.author, options.userArgs);
  if (!userOptions) {
    return options.reply("Something went wrong.");
  }
  if (userOptions.user?.status === false) {
    return options.reply(userOptions.user.message);
  }

  const beatmapId = userOptions.beatmapId || (await getBeatmapId_FromContext(interaction, client));
  if (!beatmapId) {
    return options.reply(`There doesn't seem to be any beatmap embeds in this conversation.`);
  }
  const beatmap = await v2.beatmap.id.details(beatmapId);

  let file = await getMap(beatmapId.toString())?.data;
  if (!file || !["ranked", "loved", "approved"].includes(beatmap.status)) {
    file = await downloadMap(beatmapId);
    insertData({ table: "maps", id: beatmapId.toString(), data: file });
  }

  const beatmapDetails = await new BeatmapDetails().initialize(beatmap, { mods: userOptions.mods || [""] }, file);

  return options.reply({ embeds: [await buildMapEmbed(beatmapDetails)] });
}

async function buildMapEmbed(map: BeatmapDetails) {
  const mapAuthor = await v2.user.details(map.creator, "osu");

  return new EmbedBuilder()
    .setTitle(`${map.artist} - ${map.title}`)
    .setURL(`https://osu.ppy.sh/b/${map.id}`)
    .setAuthor({
      name: `Beatmap by ${mapAuthor.username}`,
      iconURL: mapAuthor.avatar_url,
    })
    .setThumbnail(`https://assets.ppy.sh/beatmaps/${map.setId}/covers/list.jpg`)
    .setDescription(`${map.modeEmoji} **[${map.version}]**\nStars: **\`${map.stars}\`** Mods: \`${map.mods === "+" ? "+NM" : map.mods}\` BPM: \`${map.bpm}\`\nLength: \`${map.mapLength}\` Max Combo: \`${map.maxCombo}\` Objects: \`${map.totalObjects}\`\nAR: \`${map.ar}\` OD: \`${map.od}\` CS: \`${map.cs}\` HP: \`${map.hp}\`\n\n:heart: **${map.favorited}** :play_pause: **${map.playCount}**`)
    .setFields({ name: "PP", value: map.ppValues, inline: true }, { name: "Links", value: map.links, inline: true })
    .setFooter({ text: map.updatedAt });
}