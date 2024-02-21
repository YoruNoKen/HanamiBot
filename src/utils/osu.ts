/* eslint-disable @stylistic/no-mixed-operators */
import { Mode } from "../types/osu";
import { getMap, insertData } from "./database";
import { Beatmap, Calculator } from "rosu-pp";
import { DownloadEntry, DownloadStatus, Downloader } from "osu-downloader";
import { ModsEnum } from "osu-web.js";
import { ChannelType } from "lilybird";
import type { UserScore, UserBestScore, AccessTokenJSON, AuthScope, LeaderboardScore, LeaderboardScoresRaw, PerformanceInfo, Score } from "../types/osu";
import type { Client, EmbedStructure, Message } from "lilybird";
import type { GameMode, Mod } from "osu-web.js";
import type { Score as ScoreData } from "rosu-pp";

/**
 * Build OAuth authorization URL for osu! using the provided parameters.
 * @param clientId - Client ID for the application.
 * @param callbackUri - Redirect URI where the authorization code will be sent.
 * @param scope - Array of authorization scopes.
 * @param state - Optional parameter for preserving state between the request and callback.
 * @returns Fully constructed authorization URL.
 */
export function buildAuthUrl(clientId: string | number, callbackUri: string, scope: Array<AuthScope>, state?: string): string {
    // Create a new URL to later append parameters.
    const url = new URL("https://osu.ppy.sh/oauth/authorize");

    // Initialize parameters
    const params: Record<string, string> = {
        client_id: clientId.toString(),
        redirect_uri: callbackUri,
        response_type: "code",
        scope: scope.join(" "),
        state: state ?? ""
    };

    // Append parameters to URL.
    for (const [key, value] of Object.entries(params)) url.searchParams.append(key, value);

    return url.href;
}

/**
 * Gets the access token of the client.
 * @param clientId - Client ID for the application.
 * @param clientSecret - Client Secret for the application.
 * @param scope - Array of authorization scopes.
 * @returns An object containing the access token and its expiration date.
 */
export async function getAccessToken(clientId: number, clientSecret: string, scope: Array<AuthScope>):
Promise<{
    accessToken: string,
    expiresIn: string
}> {
    const body = JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope.join(" "),
        code: "code"
    });

    const request = await fetch("https://osu.ppy.sh/oauth/token", {
        method: "POST",
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Content-Type": "application/json"
        },
        body
    });
    if (!request.ok) throw new Error("Couldn't GET access token");
    const data = await request.json() as AccessTokenJSON;

    return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export function getModsEnum(mods: Array<Mod>, derivativeModsWithOriginal?: boolean): number {
    return mods.reduce((count, mod) => {
        if (
            ![
                "NF",
                "EZ",
                "TD",
                "HD",
                "HR",
                "SD",
                "DT",
                "RX",
                "HT",
                "NC",
                "FL",
                "AT",
                "SO",
                "AP",
                "PF",
                "4K",
                "5K",
                "6K",
                "7K",
                "8K",
                "FI",
                "RD",
                "CN",
                "TP",
                "K9",
                "KC",
                "1K",
                "2K",
                "3K",
                "SV2",
                "MR"
            ].includes(mod)
        )
            return count;

        if (mod === "NC" && derivativeModsWithOriginal)
            return count + ModsEnum.NC + ModsEnum.DT;

        if (mod === "PF" && derivativeModsWithOriginal)
            return count + ModsEnum.PF + ModsEnum.SD;

        return count + ModsEnum[mod as keyof typeof ModsEnum];
    }, 0);
}

export async function getBeatmapTopScores({
    beatmapId,
    isGlobal,
    mode,
    mods
}: { beatmapId: number, isGlobal: boolean, mode: GameMode, mods: Array<Mod> | undefined }): Promise<LeaderboardScoresRaw> {
    return fetch(
        `https://osu.ppy.sh/beatmaps/${beatmapId}/scores?mode=${mode}&type=${isGlobal ? "global" : "country"}${mods ? mods.map((mod) => `&mods[]=${mod.toUpperCase()}`).join("") : ""}`,
        {
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "application/json",
                Cookie: `osu_session=${process.env.ACCESS_TOKEN}`
            }
        }
    ).then((res) => { return <LeaderboardScoresRaw><unknown>res.json(); });
}

export async function getPerformanceResults({ play, setId, beatmapId, maxCombo, accuracy, hitValues, mods, mapData }:
{
    play?: UserBestScore | UserScore | Score | LeaderboardScore,
    setId?: number,
    beatmapId: number,
    maxCombo?: number,
    accuracy?: number,
    hitValues?: { count_100: number | null, count_300: number | null, count_50: number | null, count_geki: number | null, count_katu: number | null, count_miss: number | null },
    mods: Array<Mod> | number,
    mapData?: string
}): Promise<PerformanceInfo | null> {
    let rulesetId: number;
    if (typeof play !== "undefined" && "mode_int" in play)
        rulesetId = play.mode_int;
    else if (typeof play !== "undefined" && "mode" in play) rulesetId = play.ruleset_id;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    else rulesetId = setId!;

    mapData ??= getMap(beatmapId)?.data ?? (await downloadBeatmap([beatmapId]))[0].contents;
    if (!mapData) return null;

    const calculatorData: ScoreData = {
        mode: rulesetId,
        mods: typeof mods === "number" ? mods : getModsEnum(mods, true)
    };

    const beatmap = new Beatmap({ content: mapData });
    const calculator = new Calculator(calculatorData);

    const mapValues = calculator.mapAttributes(beatmap);
    const perfectPerformance = calculator.performance(beatmap);

    let {
        count_100: count100,
        count_300: count300,
        count_50: count50,
        count_geki: countGeki,
        count_katu: countKatu,
        count_miss: countMiss
    } = hitValues ?? {};
    count100 ??= 0;
    count300 ??= 0;
    count50 ??= 0;
    countGeki ??= 0;
    countKatu ??= 0;
    countMiss ??= 0;

    countGeki = [2, 3].includes(rulesetId) ? countGeki : 0;
    countKatu = [2, 3].includes(rulesetId) ? countKatu : 0;

    const currentPerformance = (typeof accuracy === "undefined"
        ? calculator
            .n300(count300)
            .n100(count100)
            .n50(count50)
            .nGeki(countGeki)
            .nKatu(countGeki)
        : calculator.acc(accuracy))
        .nMisses(countMiss)
        .combo(maxCombo ?? perfectPerformance.difficulty.maxCombo)
        .performance(beatmap);

    const fcPerformance = (!accuracy
        ? calculator.n300(count300).n100(count100).n50(count50)
        : calculator.acc(accuracy))
        .nMisses(0)
        .combo(perfectPerformance.difficulty.maxCombo)
        .nGeki(countGeki)
        .nKatu(countKatu)
        .performance(beatmap);

    return { mapValues, perfectPerformance, currentPerformance, fcPerformance, mapId: beatmapId };
}

export async function downloadBeatmap(ids: Array<number>): Promise<Array<{
    id: string | number | undefined,
    contents: string | undefined
}>> {
    const downloader = new Downloader({
        rootPath: "./cache",
        filesPerSecond: 0,
        synchronous: true
    });
    downloader.addMultipleEntries(ids.map((id) => new DownloadEntry({ id, save: false })));

    const downloaderResponse = await downloader.downloadAll();
    if (downloaderResponse.some((item) => item.status === DownloadStatus.FailedToDownload))
        throw new Error("ERROR CODE 409, ABORTING TASK");

    for (const downloaded of downloaderResponse) insertData({ table: "maps", id: downloaded.id ?? 0, data: [ { name: "data", value: downloaded.buffer?.toString() ?? "" } ] });

    return downloaderResponse.map((response) => ({ id: response.id, contents: response.buffer?.toString() }));
}

export function accuracyCalculator(mode: Mode, hits: {
    count_300: number | null,
    count_100: number | null,
    count_50: number | null,
    count_miss: number | null,
    count_geki: number | null,
    count_katu: number | null
}): number {
    let {
        count_100: count100,
        count_300: count300,
        count_50: count50,
        count_geki: countGeki,
        count_katu: countKatu,
        count_miss: countMiss
    } = hits;
    count100 ??= 0;
    count300 ??= 0;
    count50 ??= 0;
    countGeki ??= 0;
    countKatu ??= 0;
    countMiss ??= 0;

    let acc = 0.0;

    switch (mode) {
        case Mode.OSU: acc = (6 * count300 + 2 * count100 + count50) / (6 * (count50 + count100 + count300 + countMiss)); break;
        case Mode.TAIKO: acc = (2 * count300 + count100) / (2 * (count300 + count100 + countMiss)); break;
        case Mode.FRUITS: acc = count300 + count100 + count50 + countKatu + countMiss; break;
        case Mode.MANIA: acc = (6 * countGeki + 6 * count300 + 4 * countKatu + 2 * count100 + count50) / (6 * (count50 + count100 + count300 + countMiss + countGeki + countKatu)); break;
    }

    return 100 * acc;
}

function findId(embed: EmbedStructure): number | null {
    const urlToCheck = embed.url ?? embed.author?.url;
    return urlToCheck && !(/\/(user|u)/).test(urlToCheck) ? Number((/\d+/).exec(urlToCheck)?.[0]) : null;
}

function getEmbedFromReply(message: Message): number | null {
    const { referencedMessage } = message;
    if (typeof referencedMessage?.embeds === "undefined")
        return null;

    const foundId = findId(referencedMessage.embeds[0]);
    return Number(foundId) || null;
}

async function cycleThroughEmbeds({ client, message, channelId }: { message?: Message, channelId?: string, client: Client }): Promise<number | null | undefined> {
    const channel = await client.rest.getChannel(message?.channelId ?? channelId ?? "");
    if (!channel.id || channel.type !== ChannelType.GUILD_TEXT) return;

    const messages = await client.rest.getChannelMessages(channel.id, { limit: 100 });

    let beatmapId;
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (!(msg.embeds.length > 0 && msg.author.bot))
            continue;

        beatmapId = findId(msg.embeds[0]);
        if (beatmapId)
            break;
    }
    return beatmapId;
}

export async function getBeatmapIdFromContext({ client, message, channelId }: { message?: Message, client: Client, channelId?: string }): Promise<number | null | undefined> {
    return typeof message?.referencedMessage !== "undefined" ? getEmbedFromReply(message) : cycleThroughEmbeds({ message, client, channelId });
}

export function getRetryCount(retryMap: Array<number>, mapId: number): number {
    let retryCounter = 0;
    for (let i = 0; i < retryMap.length; i++) {
        if (retryMap[i] === mapId)
            retryCounter++;
    }
    return retryCounter;
}
