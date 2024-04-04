import type { DatabaseUser } from "./database";
import type { CapitalUser } from "./osuCapital";
import type { UserScore, UserBestScore, Beatmap, LeaderboardScores, Mode, Score } from "./osu";
import type { UserExtended, Mod } from "osu-web.js";

export const enum EmbedBuilderType {
    COMPARE = "compareBuilder",
    LEADERBOARD = "leaderboardBuilder",
    MAP = "mapBuilder",
    PLAYS = "playBuilder",
    PROFILE = "profileBuilder",
    AVATAR = "avatarBuilder",
    BACKGROUND = "backgroundBuilder",
    BANNER = "bannerBuilder"
}

interface ModStructure {
    exclude: null | boolean;
    include: null | boolean;
    forceInclude: null | boolean;
    name: null | Mod;
}

export interface BuilderOptions {
    type: EmbedBuilderType;
    initiatorId: string;
}

export interface CompareBuilderOptions extends BuilderOptions {
    type: EmbedBuilderType.COMPARE;
    beatmap: Beatmap;
    plays: Array<Score>;
    user: UserExtended;
    mode: Mode;
    mods?: ModStructure;

}

export interface LeaderboardBuilderOptions extends BuilderOptions {
    type: EmbedBuilderType.LEADERBOARD;
    scores: Array<LeaderboardScores>;
    beatmap: Beatmap;
    page: number | undefined;
}

export interface MapBuilderOptions extends BuilderOptions {
    type: EmbedBuilderType.MAP;
    beatmapId: number;
    mods: Array<Mod> | null;
}

export interface PlaysBuilderOptions extends BuilderOptions {
    plays: Array<UserBestScore> | Array<UserScore>;
    type: EmbedBuilderType.PLAYS;
    user: UserExtended;
    mode: Mode;
    userDb: DatabaseUser | null;
    index?: number;
    isMultiple?: boolean;
    sortByDate?: boolean;
    page?: number;
    isPage?: boolean;
    mods?: ModStructure;
}

export interface ProfileBuilderOptions extends BuilderOptions {
    type: EmbedBuilderType.PROFILE;
    user: UserExtended;
    mode: Mode;
    capitalUser?: CapitalUser;
}

export interface AvatarBuilderOptions extends BuilderOptions {
    type: EmbedBuilderType.AVATAR;
    user: UserExtended;
}

export interface BackgroundBuilderOptions extends BuilderOptions {
    type: EmbedBuilderType.BACKGROUND;
    beatmap: Beatmap;
}

export interface BannerBuilderOptions extends BuilderOptions {
    type: EmbedBuilderType.BANNER;
    user: UserExtended;
    mode: Mode;
}

export type EmbedBuilderOptions = CompareBuilderOptions
    | LeaderboardBuilderOptions
    | MapBuilderOptions
    | PlaysBuilderOptions
    | ProfileBuilderOptions
    | AvatarBuilderOptions
    | BackgroundBuilderOptions;
