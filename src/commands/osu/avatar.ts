import { getCommandArgs } from "../../utils/args";
import { client } from "../../utils/initalize";
import { UserType } from "../../types/commandArgs";
import { EmbedBuilderType } from "../../types/embedBuilders";
import { avatarBuilder } from "../../embed-builders/avatar";
import { ApplicationCommandOptionType, EmbedType } from "lilybird";
import type { ApplicationCommandData, Interaction } from "lilybird";
import type { SlashCommand } from "@lilybird/handlers";

export default {
    post: "GLOBAL",
    data: {
        name: "avatar",
        description: "Display the avatar of a user.",
        options: [
            {
                type: ApplicationCommandOptionType.STRING,
                name: "username",
                description: "Specify an osu! username"
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

async function run(interaction: Interaction<ApplicationCommandData>): Promise<void> {
    if (!interaction.inGuild()) return;
    await interaction.deferReply();

    const args = getCommandArgs(interaction);

    if (typeof args === "undefined") return;
    const { user } = args;

    if (user.type === UserType.FAIL) {
        await interaction.editReply(user.failMessage);
        return;
    }

    const osuUserRequest = await client.safeParse(client.users.getUser(user.banchoId, { urlParams: { mode: user.mode } }));
    if (!osuUserRequest.success) {
        await interaction.editReply({
            embeds: [
                {
                    type: EmbedType.Rich,
                    title: "Uh oh! :x:",
                    description: `It seems like this user doesn't exist! :(`
                }
            ]
        });
        return;
    }
    const osuUser = osuUserRequest.data;

    const embeds = avatarBuilder({
        type: EmbedBuilderType.AVATAR,
        initiatorId: interaction.member.user.id,
        user: osuUser
    });

    await interaction.editReply({ embeds });
}
