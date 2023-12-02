import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import { v2 } from "osu-api-extended";
import { getUser } from "../functions";
import { ExtendedClient, Locales, osuModes, UserInfo } from "../Structure/index";
import { approxMorePp, calculateMissingPp, getUsernameFromArgs, Interactionhandler, rulesets } from "../utils";

export async function start({ interaction, client, locale }: { interaction: Message | ChatInputCommandInteraction; client: ExtendedClient; locale: Locales }) {
  const options = Interactionhandler(interaction);
  const { reply, mode, rankValue } = options;

  const userOptions = getUsernameFromArgs(options.author, options.userArgs);
  if (!userOptions) {
    return reply(locale.fails.error);
  }
  if (userOptions.user?.status === false) {
    return reply(userOptions.user.message);
  }

  const user = await v2.user.details(userOptions.user, mode);
  if (!user.id) {
    return reply(locale.fails.userDoesntExist.replace("{USER}", userOptions.user));
  }

  const userRank = user.statistics.global_rank;
  console.log(userRank, rankValue);
  if (userRank <= rankValue) {
    return reply(locale.embeds.rank.rankHigh.replace("{USERNAME}", user.username));
  }

  const data: any = await fetch(`https://osudaily.net/api/pp.php?k=${Bun.env.OSU_DAILY_API}&m=${rulesets[mode]}&t=rank&v=${rankValue}`).then(res => res.json());

  const pps = (await v2.scores.user.category(user.id, "best", { limit: "100", mode }))
    .map(play => Number(play.pp));
  approxMorePp(pps);
  const missingPp = calculateMissingPp(user.statistics.pp, Number(data.pp), pps);

  await reply({ embeds: [await getEmbed(getUser({ user, mode, locale }), missingPp, rankValue, data, locale)] });
}

async function getEmbed(user: UserInfo, missingPps: number[], rankValue: number, data: any, locale: Locales) {
  const [targetPp, idx] = missingPps;

  const embed = new EmbedBuilder().setTitle(locale.embeds.rank.playerMissing.replace("{USERNAME}", user.username).replace("{RANK}", rankValue.toLocaleString())).setColor("Purple")
    .setAuthor({
      name: `${user.username} ${user.pp}pp (#${user.globalRank} ${user.countryCode}#${user.countryRank})`,
      iconURL: user.userAvatar,
      url: user.userUrl,
    });

  return embed.setDescription(
    locale.embeds.rank.description
      .replace("{TARGET}", rankValue.toString())
      .replace("{USERNAME}", user.username)
      .replace("{PP}", targetPp.toFixed(2))
      .replace("{POSITION}", (idx + 1).toString())
      .replace("{NEWPP}", data.pp.toFixed(2)),
  );
}
