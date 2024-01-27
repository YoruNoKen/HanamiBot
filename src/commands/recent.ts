import { getCommandArgs } from "../utils/args";
import { profileBuilder } from "../embed-builders/profile";
import { ApplicationCommandOptionType } from "lilybird";
import { v2 } from "osu-api-extended";
import type { ApplicationCommandData, Interaction } from "lilybird";
import type { SlashCommand } from "@lilybird/handlers";

async function run(interaction: Interaction<ApplicationCommandData>): Promise<void> {
    if (!interaction.inGuild()) return;
    await interaction.deferReply();

    const { user } = getCommandArgs(interaction);

    if (user.type === "fail") {
        await interaction.editReply(user.failMessage);
        return;
    }

    const osuUser = await v2.user.details(user.banchoId, user.mode);
    if (!osuUser.id) {
        await interaction.editReply("This user does not exist.");
        return;
    }

    const embed = profileBuilder(osuUser, user.mode);

    await interaction.editReply({ embeds: [embed] });
}

export default {
    post: "GLOBAL",
    data: {
        name: "recent",
        description: "Display recent play(s) of a user.",
        options: [
            {
                type: ApplicationCommandOptionType.STRING,
                name: "username",
                description: "Specify an osu! username"
            },
            {
                type: ApplicationCommandOptionType.STRING,
                name: "mode",
                description: "Specify an osu! mode",
                choices: [ { name: "osu", value: "osu" }, { name: "mania", value: "mania" }, { name: "taiko", value: "taiko" }, { name: "ctb", value: "fruits" } ]
            },

            {
                type: ApplicationCommandOptionType.INTEGER,
                name: "index",
                description: "Specify an index, defaults to 1.",
                min_value: 1,
                max_value: 100
            },
            {
                type: ApplicationCommandOptionType.STRING,
                name: "mods",
                description: "Specify a mods combination.",
                min_length: 2
            },
            {
                type: ApplicationCommandOptionType.STRING,
                name: "grade",
                description: "Consider scores only with this grade.",
                choices: ["SS", "S", "A", "B", "C", "D"].map((grade) => ({ name: grade, value: grade }))
            },
            {
                type: ApplicationCommandOptionType.BOOLEAN,
                name: "passes",
                description: "Whether or not only passes should be considered."
            },
            {
                type: ApplicationCommandOptionType.USER,
                name: "discord",
                description: "Specify a linked Discord user"
            }
        ]
    },
    run
} satisfies SlashCommand;