import { rulesets, getMap, insertData, getRetryCount, grades, formatNumber, buildActionRow, showLessButton, showMoreButton, previousButton, nextButton, loadingButtons, buttonBoolsIndex, buttonBoolsTops, downloadMap, getPerformanceDetails, osuEmojis, specifyButton, firstButton, lastButton } from "./utils";
import { response as ScoreResponse } from "osu-api-extended/dist/types/v2_scores_user_category";
import { response as BeatmapResponse } from "osu-api-extended/dist/types/v2_beatmap_id_details";
import { response as UserOsu } from "osu-api-extended/dist/types/v2_user_details";
import { Message, ButtonInteraction, Client, Collection, ModalSubmitInteraction } from "discord.js";
import { tools, v2 } from "osu-api-extended";
import { osuModes, commandInterface } from "./types";

export class UserDetails {
  username: string;
  userCover: string;
  userAvatar: string;
  userUrl: string;
  coverUrl: string;
  userFlag: string;
  countryCode: string;
  highestRank: string | undefined;
  highestRankTime: number | undefined;
  recommendedStarRating: string;
  userJoinedAgo: string;
  formattedDate: string;
  globalRank: string;
  countryRank: string;
  pp: string;
  accuracy: string;
  level: string;
  playCount: string;
  playHours: string;
  followers: string;
  maxCombo: string;
  rankS: string;
  rankA: string;
  rankSs: string;
  rankSh: string;
  rankSsh: string;
  emoteA: string;
  emoteS: string;
  emoteSh: string;
  emoteSs: string;
  emoteSsh: string;
  rankedScore: string;
  totalScore: string;
  objectsHit: string;
  occupation: string;
  interest: string;
  location: string;

  constructor(user: UserOsu, mode: osuModes) {
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "UTC",
    } as any;

    const stats = user.statistics;
    const date = new Date(user.join_date);
    const months = Math.floor((Date.now() - date.valueOf()) / (1000 * 60 * 60 * 24 * 30));

    this.username = user.username;
    this.userCover = user.cover_url;
    this.userAvatar = user.avatar_url;
    this.userUrl = `https://osu.ppy.sh/users/${user.id}/${mode}`;
    this.coverUrl = user.cover_url;
    this.userFlag = `https://osu.ppy.sh/images/flags/${user.country_code}.png`;
    this.countryCode = user.country.code;
    this.globalRank = stats.global_rank?.toLocaleString() || "-";
    this.countryRank = stats.country_rank?.toLocaleString() || "-";
    this.pp = stats.pp.toLocaleString();
    this.rankedScore = stats.ranked_score.toLocaleString();
    this.totalScore = stats.total_score.toLocaleString();
    this.objectsHit = stats.total_hits.toLocaleString();
    this.occupation = `**Occupation:**\n \`${user.occupation}\`\n` ?? "";
    this.interest = `**Interests:**\n \`${user.interests}\`\n` ?? "";
    this.location = `**Location:**\n \`${user.location}\`` ?? "";
    this.highestRank = user.rank_highest?.rank.toLocaleString() || undefined;
    this.highestRankTime = user.rank_highest ? new Date(user.rank_highest.updated_at).getTime() / 1000 : undefined;
    this.recommendedStarRating = (Math.pow(stats.pp, 0.4) * 0.195).toFixed(2);
    this.userJoinedAgo = (months / 12).toFixed(1);
    this.formattedDate = date.toLocaleDateString("en-US", timeOptions);
    this.accuracy = stats.hit_accuracy.toFixed(2);
    this.level = `${user.statistics.level.current}.${stats.level.progress.toString(10).padStart(2, "0")}`;
    this.playCount = stats.play_count.toLocaleString();
    this.playHours = (stats.play_time / 3600).toFixed(0);
    this.followers = user.follower_count.toLocaleString();
    this.maxCombo = stats.maximum_combo.toLocaleString();
    this.rankS = stats.grade_counts.s.toLocaleString();
    this.rankA = stats.grade_counts.a.toLocaleString();
    this.rankSs = stats.grade_counts.ss.toLocaleString();
    this.rankSh = stats.grade_counts.sh.toLocaleString();
    this.rankSsh = stats.grade_counts.ssh.toLocaleString();
    this.emoteA = grades.A;
    this.emoteS = grades.S;
    this.emoteSh = grades.SH;
    this.emoteSs = grades.X;
    this.emoteSsh = grades.XH;
  }
}

export class ScoreDetails {
  plays: ScoreResponse[];
  index: number;
  mode: osuModes;
  _isTops?: boolean;
  isCompare?: boolean;
  perfDetails?: any;
  beatmap?: BeatmapResponse;
  file: string;

  percentagePassed: string | undefined;
  modsPlay: string | undefined;
  globalPlacement: string | undefined;
  beatmapId: number | undefined;
  countCircles: number | undefined;
  countSliders: number | undefined;
  countSpinners: number | undefined;
  hitLength: number | undefined;
  placement: number | undefined;
  version: string | undefined;
  creatorId: number | undefined;
  creatorUsername: string | undefined;
  mapStatus: string | undefined;
  mapsetId: number | undefined;
  count100: number | undefined;
  count300: number | undefined;
  count50: number | undefined;
  countGeki: number | undefined;
  countKatu: number | undefined;
  countMiss: number | undefined;
  retries: number | undefined;
  totalScore: string | undefined;
  accuracy: string | undefined;
  artist: string | undefined;
  title: string | undefined;
  grade: string | undefined;
  submittedTime: number | undefined;
  minutesTotal: string | undefined;
  secondsTotal: string | undefined;
  bpm: any;
  mapValues: string | undefined;
  stars: any;
  accValues: string | undefined;
  comboValue: string | undefined;
  pp: any;
  fcPp: any;
  ssPp: any;
  totalResult: string | undefined;
  ifFcValue: string | undefined;

  async initialize() {
    const play = this.plays[this.index];
    const rulesetId = rulesets[this.mode];

    (play.beatmap as any) = this.isCompare ? this.beatmap : play.beatmap;
    (play.beatmapset as any) = this.isCompare ? this.beatmap?.beatmapset : play.beatmapset;

    const { id: beatmapId, count_circles, count_sliders, count_spinners, hit_length, version } = play.beatmap;
    const { user_id: creatorId, creator: creatorUsername, status: mapStatus, id: mapsetId, artist, title } = play.beatmapset;
    const { count_100, count_300, count_50, count_geki, count_katu, count_miss } = play.statistics;

    const objectshit = count_300 + count_100 + count_50 + count_miss;
    const objects = count_circles + count_sliders + count_spinners;

    const percentageNum = Number((objectshit / objects) * 100);

    this.percentagePassed = percentageNum === 100 || play.passed == true ? "" : `@${percentageNum.toFixed(1)}% `;

    const retryCounter = this.isCompare ? undefined : getRetryCount(this.plays.map((x) => x.beatmap.id).splice(this.index, this.plays.length), beatmapId);

    this.modsPlay = play.mods.length > 0 ? `**+${play.mods.join("").toUpperCase()}**` : "**+NM**";

    let hitLength = play.beatmap.hit_length;
    let totalLength = play.beatmap.hit_length;
    if (this.modsPlay.toLowerCase().includes("dt")) {
      hitLength = hitLength! / 1.5;
      totalLength = totalLength! / 1.5;
    }

    const performance = this.isCompare ? this.perfDetails : getPerformanceDetails({ modsArg: play.mods, maxCombo: play.max_combo, rulesetId, hitValues: { count_100, count_300, count_50, count_geki, count_katu, count_miss }, mapText: this.file });

    this.globalPlacement = "";
    if (play.passed && play.best_id) {
      const scoreGlobal = await v2.scores.details(play.best_id, this.mode);
      if (scoreGlobal && scoreGlobal.rank_global < 10000) {
        this.globalPlacement = `**__Global Rank #${scoreGlobal.rank_global}:__**`;
      }
    }
    this.beatmapId = beatmapId;
    this.countCircles = count_circles;
    this.countSliders = count_sliders;
    this.countSpinners = count_spinners;
    this.hitLength = hit_length;
    this.placement = play.position;
    this.version = version;
    this.creatorId = creatorId;
    this.creatorUsername = creatorUsername;
    this.mapStatus = mapStatus;
    this.mapsetId = mapsetId;
    this.count100 = count_100;
    this.count300 = count_300;
    this.count50 = count_50;
    this.countGeki = count_geki;
    this.countKatu = count_katu;
    this.countMiss = count_miss;
    this.retries = retryCounter;
    this.totalScore = play.score.toLocaleString();
    this.accuracy = `${Number(play.accuracy * 100).toFixed(2)}%`;
    this.artist = artist;
    this.title = title;
    this.grade = grades[play.rank];
    this.submittedTime = new Date(play.created_at).getTime() / 1000;
    this.minutesTotal = Math.floor(totalLength! / 60).toFixed();
    this.secondsTotal = (totalLength! % 60).toFixed().toString().padStart(2, "0");
    this.bpm = performance.mapValues.bpm.toFixed();
    this.mapValues = `AR: ${formatNumber(performance.mapValues.ar, 1)} OD: ${formatNumber(performance.mapValues.od, 1)} CS: ${formatNumber(performance.mapValues.cs, 1)} HP: ${formatNumber(performance.mapValues.hp, 2)}`;
    this.stars = performance.maxPerf.difficulty.stars.toFixed(2);

    this.accValues = `{ **${rulesetId === 3 ? count_geki + "/" : ""}${count_300}**/${rulesetId === 3 ? count_katu + "/" : ""}${count_100}/${rulesetId === 1 ? "" : count_50 + "/"}${count_miss} }`;
    this.comboValue = `[ **${play.max_combo}**x/${performance.maxPerf.difficulty.maxCombo}x ]`;
    this.pp = performance.curPerf.pp.toFixed(2);
    this.fcPp = performance.fcPerf.pp.toFixed(2);
    this.ssPp = performance.maxPerf.pp.toFixed(2);

    this.totalResult = `**${this.pp}**/${this.ssPp}pp • ${this.comboValue} • ${this.accValues}`;
    this.ifFcValue = "";
    if ((performance.curPerf as any).effectiveMissCount > 0) {
      const Map300CountFc = objects - count_100 - count_50;

      const FcAcc = tools.accuracy(
        {
          300: Map300CountFc.toString(),
          geki: count_geki.toString(),
          100: count_100.toString(),
          katu: count_katu.toString(),
          50: count_50.toString(),
          0: "0",
        },
        this.mode
      );

      this.ifFcValue = `If FC: **${this.fcPp}**pp for **${FcAcc.toFixed(2)}%**`;
    }
    return this;
  }

  constructor({ plays, index, mode, _isTops, isCompare, perfDetails, beatmap, file }: { plays: ScoreResponse[]; index: number; mode: osuModes; _isTops?: boolean; isCompare?: boolean; perfDetails?: any; beatmap?: BeatmapResponse; file: string }) {
    this.plays = plays;
    this.index = index;
    this.mode = mode;
    this._isTops = _isTops;
    this.isCompare = isCompare;
    this.perfDetails = perfDetails;
    this.beatmap = beatmap;
    this.file = file;
  }
}

export class BeatmapDetails {
  title: string;
  artist: string;
  version: string;
  mode: string;
  id: number;
  setId: number;
  creator: string;
  rulesetId: number;
  totalObjects: any;
  stars: string;
  mods: string;
  bpm: string;
  totalLength: number;
  mapLength: string;
  maxCombo: number;
  ar: string;
  od: string;
  hp: string;
  cs: string;
  favorited: string;
  playCount: string;
  ppValues: string;
  links: string;
  background: string;
  updatedAt: string;
  modeEmoji: string;

  constructor(map: BeatmapResponse, valueOptions: { mods: string[]; accuracy?: number; ar?: number; od?: number; cs?: number }, file?: string) {
    const set = map.beatmapset;
    this.title = set.title;
    this.artist = set.artist;
    this.version = map.version;
    this.mode = map.mode;
    this.id = map.id;
    this.setId = map.beatmapset_id;
    this.creator = map.beatmapset.creator;
    this.rulesetId = rulesets[this.mode];
    this.totalObjects = map.count_circles + map.count_sliders + map.count_spinners;

    const performance: Record<number, ReturnType<typeof getPerformanceDetails>> = {};
    [100, 99, 98, 95].forEach((accuracy) => {
      performance[accuracy] = getPerformanceDetails({
        modsArg: valueOptions.mods,
        maxCombo: map.max_combo,
        rulesetId: this.rulesetId,
        hitValues: {},
        accuracy: accuracy,
        mapText: file!,
      });
    });

    this.stars = performance[100].maxPerf.difficulty.stars.toFixed(2);
    this.mods = "+" + valueOptions.mods.join("");
    this.bpm = performance[100].mapValues.bpm.toFixed();
    this.totalLength = ["DT", "NC"].includes(this.mods.toUpperCase()) ? map.hit_length / 1.5 : map.hit_length;
    this.mapLength = `${Math.floor(this.totalLength / 60).toFixed()}:${(this.totalLength % 60).toFixed().toString().padStart(2, "0")}`;
    this.maxCombo = map.max_combo;

    this.ar = ["taiko", "mania"].includes(this.mode) ? "-" : performance[100].mapValues.ar.toFixed(1);
    this.od = performance[100].mapValues.od.toFixed(1);
    this.hp = performance[100].mapValues.hp.toFixed(1);
    this.cs = ["taiko", "mania"].includes(this.mode) ? "-" : performance[100].mapValues.ar.toFixed(2);

    this.favorited = map.beatmapset.favourite_count.toLocaleString();
    this.playCount = map.beatmapset.play_count.toLocaleString();

    this.ppValues = `\`\`\`Acc | PP\n100%: ${performance[100].fcPerf.pp.toFixed()}pp\n99%:  ${performance[99].fcPerf.pp.toFixed()}pp\n98%:  ${performance[98].fcPerf.pp.toFixed()}pp\n95%:  ${performance[95].fcPerf.pp.toFixed()}pp\`\`\``;
    this.links = `<:chimu:1117792339549761576>[Chimu](https://chimu.moe/d/${this.setId})\n<:beatconnect:1075915329512931469>[Beatconnect](https://beatconnect.io/b/${this.setId})\n:notes:[Song Preview](https://b.ppy.sh/preview/${this.setId}.mp3)\n🎬[Map Preview](https://osu.pages.dev/preview#${this.id})\n🖼️[Full Background](https://assets.ppy.sh/beatmaps/${this.setId}/covers/raw.jpg)`;
    this.background = `https://assets.ppy.sh/beatmaps/${map.beatmapset_id}/covers/cover.jpg`;
    this.updatedAt = `${map.status === "ranked" ? "Ranked at" : map.status === "loved" ? "Loved at" : map.status === "qualified" ? "Qualified at" : "Last updated at"} ${new Date(map.last_updated).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
    this.modeEmoji = osuEmojis[map.mode];
  }
}

export class StatsDetails {
  [x: string]: any; // temporary measure to ts bullshit

  constructor(_user: UserOsu, scores: ScoreResponse[]) {
    const lastArray = scores.length - 1;

    const ppSorted = scores.sort((a, b) => Number(a.pp) - Number(b.pp)).map((score) => score.pp);
    this.pp = { min: ppSorted[0], avg: ppSorted.reduce((acc, pp) => acc + Number(pp), 0) / scores.length, max: ppSorted[lastArray] };

    const accuracySorted = scores.sort((a, b) => Number(a.accuracy) - Number(b.accuracy)).map((score) => score.accuracy * 100);
    this.accuracy = { min: accuracySorted[0], avg: accuracySorted.reduce((acc, pp) => acc + Number(pp), 0) / scores.length, max: accuracySorted[lastArray] };

    // let's leave star for another time when I actually have a database of maps
    // const starsSorted = "";
    // this.stars = ""
  }
}

export class ButtonActions {
  private static getRow(parameters: boolean[]) {
    const buttons = [firstButton, previousButton, specifyButton, nextButton, lastButton];
    return [buildActionRow(buttons, parameters)] as any;
  }

  static async handleProfileButtons({ i, options, response }: { i: ButtonInteraction | ModalSubmitInteraction; options: any; response: Message }) {
    if (i instanceof ModalSubmitInteraction) {
      return;
    }

    await i.update({ components: [loadingButtons as any] });
    response.edit({ embeds: [options.pageBuilder[i.customId === "more" ? 1 : 0](options.options)], components: [showLessButton as any] });
  }

  static async handleRecentButtons({ pageBuilder, options, i, response }: { pageBuilder: any; options: any; i: ButtonInteraction | ModalSubmitInteraction; response: Message }) {
    const editEmbed = async (options: any) => response.edit({ embeds: [await pageBuilder(options)], components: this.getRow([options.index === 0, buttonBoolsIndex("previous", options), false, buttonBoolsIndex("next", options), options.plays.length - 1 === options.index]) });

    if (i instanceof ModalSubmitInteraction) {
      await response.edit({ components: [loadingButtons as any] });
      await editEmbed(options);
      return;
    }

    await i.update({ components: [loadingButtons as any] });
    switch (i.customId) {
      case "next":
        options.index++;
        break;
      case "previous":
        options.index--;
        break;
      case "last":
        options.index = options.plays.length - 1;
        break;
      case "first":
        options.index = 0;
        break;
    }

    editEmbed(options);
  }

  static async handleTopsButtons({ pageBuilder, options, i, response }: { pageBuilder: any; options: any; i: ButtonInteraction | ModalSubmitInteraction; response: Message }) {
    const editEmbed = async (options: any) => response.edit({ embeds: [await pageBuilder(options)], components: this.getRow([options.page === 0, buttonBoolsTops("previous", options), false, buttonBoolsTops("next", options), (options.index ? options.plays.length - 1 : Math.ceil(options.plays.length / 5) - 1) === options.page]) });

    if (i instanceof ModalSubmitInteraction) {
      await response.edit({ components: [loadingButtons as any] });
      await editEmbed(options);
      return;
    }

    await i.update({ components: [loadingButtons as any] });
    switch (i.customId) {
      case "next":
        options.index++;
        options.page++;
        break;
      case "previous":
        options.index--;
        options.page--;
        break;
      case "last":
        options.index = options.index + 1 ? options.plays.length - 1 : undefined;
        options.page = options.page + 1 ? Math.ceil(options.plays.length / 5) - 1 : undefined;
        break;
      case "first":
        options.index = options.index + 1 ? 0 : undefined;
        options.page = options.page + 1 ? 0 : undefined;
        break;
    }
    await editEmbed(options);
  }
}

export class CalculateHitResults {
  static standard({ accuracy, totalHitObjects, countMiss, count100, count50 }: { accuracy: number; totalHitObjects: number; countMiss: number; count50?: number; count100?: number }) {}

  constructor() {}
}

export class MyClient extends Client {
  [x: string]: any;
  slashCommands: Collection<any, any>;
  prefixCommands: Collection<any, any>;
  aliases: Collection<any, any>;
  sillyOptions: Record<string, commandInterface>;
  client: any;

  constructor(options: any) {
    super(options);
    this.slashCommands = new Collection();
    this.prefixCommands = new Collection();
    this.aliases = new Collection();
    this.sillyOptions = {};
  }
}
