import { getProfile } from "@cleaners/profile";
import { grades } from "@utils/emotes";
import { EmbedType } from "lilybird";
import type { ProfileBuilderOptions } from "@type/embedBuilders";
import type { EmbedAuthorStructure, EmbedFieldStructure, EmbedFooterStructure, EmbedImageStructure, EmbedStructure, EmbedThumbnailStructure } from "lilybird";

export function profileBuilder({ user, mode, capitalUser }: ProfileBuilderOptions): Array<EmbedStructure> {
    const profile = getProfile(user, mode, capitalUser);
    const author = {
        name: `${user.username}: ${profile.pp}pp (#${profile.globalRank} ${profile.countryCode}#${profile.countryRank})`,
        icon_url: profile.flagUrl,
        url: profile.userUrl
    } satisfies EmbedAuthorStructure;

    const fields = [
        {
            name: "Statistics :abacus:",
            value: [
                `**Accuracy:** \`${profile.accuracy}\` • **Level:** \`${profile.level}%\``,
                `**Playcount:** \`${profile.playCount}\` (\`${profile.playHours} hrs\`)`,
                `[**Stock Value:**](https://www.osucapital.com/stock/${user.id} "These values were gotten from osucapital.com") \`${profile.stockValue}\` • **Updated:** <t:${profile.stockUpdated}:R>`,
                `${profile.peakGlobalRank.length > 0 ? `**Peak Rank:** #\`${profile.peakGlobalRank}\` • **Achieved:** <t:${profile.peakGlobalRankTime}:R>` : "**Peak Rank:** #`-`"}`,
                `**Followers:** \`${profile.followers}\` • **Max Combo:** \`${profile.maxCombo}\``,
                `**Recommended Star Rating:** \`${profile.recommendedStarRating}\`★`
            ].join("\n"),
            inline: false
        },
        {
            name: "Grades :mortar_board:",
            value: `${grades.SSH}\`${profile.rankSsh}\` ${grades.SS}\`${profile.rankSs}\` ${grades.SH}\`${profile.rankSh}\` ${grades.S}\`${profile.rankS}\` ${grades.A}\`${profile.rankA}\``,
            inline: false
        }
    ] satisfies Array<EmbedFieldStructure>;

    const footer = { text: `Joined osu! on ${profile.joinedAt} (${profile.joinedAgo} yrs ago)` } satisfies EmbedFooterStructure;
    const thumbnail = { url: profile.avatarUrl } satisfies EmbedThumbnailStructure;
    const image = { url: profile.bannerUrl } satisfies EmbedImageStructure;

    return [ { type: EmbedType.Rich, author, fields, footer, thumbnail, image } ] satisfies Array<EmbedStructure>;
}
