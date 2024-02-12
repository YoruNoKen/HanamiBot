import { getCommandArgs } from "../../utils/args";
import { getBeatmapIdFromContext } from "../../utils/osu";
import { mapBuilder } from "../../embed-builders/mapBuilder";
import { ApplicationCommandOptionType, EmbedType } from "lilybird";
import type { Mod } from "osu-web.js";
import type { ApplicationCommandData, Interaction } from "lilybird";
import type { SlashCommand } from "@lilybird/handlers";

async function run(interaction: Interaction<ApplicationCommandData>): Promise<void> {
    if (!interaction.inGuild()) return;
    await interaction.deferReply();

    const args = getCommandArgs(interaction);

    if (typeof args === "undefined") return;
    const { user, mods } = args;

    const beatmapId = user.beatmapId ?? await getBeatmapIdFromContext({ channelId: interaction.channelId, client: interaction.client });
    if (typeof beatmapId === "undefined" || beatmapId === null) {
        await interaction.editReply({
            embeds: [
                {
                    type: EmbedType.Rich,
                    title: "Uh oh! :x:",
                    description: "It seems like the beatmap ID couldn't be found :(\n"
                }
            ]
        });
        return;
    }

    const embeds = await mapBuilder(Number(beatmapId), <Array<Mod> | null>mods.name?.match(/.{1,2}/g) ?? null);
    await interaction.editReply({ embeds });
}

export default {
    post: "GLOBAL",
    data: {
        name: "map",
        description: "Display statistics of a beatmap.",
        options: [
            {
                type: ApplicationCommandOptionType.STRING,
                name: "map",
                description: "Specify a beatmap link (eg: https://osu.ppy.sh/b/72727)"
            },
            {
                type: ApplicationCommandOptionType.STRING,
                name: "mods",
                description: "Specify a mods combination.",
                min_length: 2
            }
        ]
    },
    run
} satisfies SlashCommand;