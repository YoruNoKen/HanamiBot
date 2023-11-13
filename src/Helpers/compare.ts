import { getUsernameFromArgs, Interactionhandler, showMoreButton, getBeatmapId_FromContext, getMap, downloadMap, insertData, getPerformanceDetails, rulesets } from "../utils";
import { Message, ChatInputCommandInteraction, EmbedBuilder, ButtonInteraction, Client } from "discord.js";
import { response as BeatmapResponse } from "osu-api-extended/dist/types/v2_beatmap_id_details";
import { response as ScoreResponse } from "osu-api-extended/dist/types/v2_scores_user_beatmap";
import { response as MapResponse } from "osu-api-extended/dist/types/v2_beatmap_id_details";
import { UserDetails, ScoreDetails } from "../classes";
import { osuModes } from "../types";
import { v2 } from "osu-api-extended";

const leaderboardExists = (beatmap: BeatmapResponse) => typeof beatmap.id === "number" || ["qualified", "ranked", "loved"].includes(beatmap.status?.toLowerCase());

export async function start({ interaction, client, args, mode }: { interaction: Message<boolean>; client: Client<boolean>; args: string[]; mode: osuModes | string }) {
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
  if (!leaderboardExists(beatmap)) {
    return options.reply("Either this map doesn't exist, or it doesn't have a leaderboard.");
  }

  mode = mode.length > 0 ? mode : beatmap.mode;

  const user = await v2.user.details(userOptions.user, options.mode);
  if (!user.id) {
    return options.reply(`The user \`${userOptions.user}\` does not exist in Bancho.`);
  }
  const userDetailOptions = new UserDetails(user, options.mode);

  let scores = await v2.scores.user.beatmap(beatmap.id, user.id, { mode: mode as osuModes });
  if (scores.length === 0) {
    return options.reply(`${user.username} has no scores on this beatmap`);
  }

  return options.reply({ embeds: [await buildCompareEmbed(userDetailOptions, beatmap, scores, mode)] });
}

async function buildCompareEmbed(user: UserDetails, map: MapResponse, scores: ScoreResponse[], mode: string) {
  let file = await getMap(map.id.toString())?.data;
  if (!file || !["ranked", "loved", "approved"].includes(map.status)) {
    file = await downloadMap(map.id);
    insertData({ table: "maps", id: map.id.toString(), data: file });
  }

  const _scores = [];
  for (let i in scores) {
    const { mods, max_combo, statistics } = scores[i];

    const scorePerf = getPerformanceDetails({ modsArg: mods, maxCombo: max_combo, rulesetId: rulesets[mode], hitValues: statistics, mapText: file });
    const score = await new ScoreDetails().initialize(scores as any, parseInt(i), mode as osuModes, false, true, scorePerf, map);
    _scores.push(
      i === "0"
        ? `${score.grade} ${score.modsPlay} **[${score.stars}★]** • ${score.totalScore} • ${score.accuracy}\n**${score.pp}pp**/${score.ssPp}pp ~~[${score.fcPp}pp]~~ • ${score.comboValue}\n${score.accValues} <t:${score.submittedTime}:R>\n`
        : `${score.grade} ${score.modsPlay} **[${score.stars}★]** • **${score.pp}pp** (${score.accuracy}) • **${max_combo}x** • ${(scorePerf.curPerf as any).effectiveMissCount > 0 ? `${score.countMiss} <:hit00:1061254490075955231>` : ""} <t:${score.submittedTime}:R>`
    );
  }

  return new EmbedBuilder()
    .setAuthor({
      name: `${user.username} ${user.pp}pp (#${user.globalRank} ${user.countryCode}#${user.countryRank})`,
      // iconURL: `https://osu.ppy.sh/images/flags/${countryCode}.png`,
      iconURL: user.userAvatar,
      url: user.userUrl,
    })
    .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}]`)
    .setURL(`https://osu.ppy.sh/b/${map.id}`)
    .setDescription(_scores.join("\n"))
    .setThumbnail(`https://assets.ppy.sh/beatmaps/${map.beatmapset_id}/covers/list.jpg`);
}
