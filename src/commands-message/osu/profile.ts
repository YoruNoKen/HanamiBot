import { parseOsuArguments } from "@utils/args";
import { profileBuilder } from "@builders/profile";
import { client } from "@utils/initalize";
import { UserType } from "@type/commandArgs";
import { EmbedBuilderType } from "@type/embedBuilders";
import { Mode } from "@type/osu";
import { getStockProfile } from "@utils/osuCapital";
import { EmbedScoreType } from "@type/database";
import { EmbedType } from "lilybird";
import type { CapitalUser } from "@type/osuCapital";
import type { GuildTextChannel, Message } from "@lilybird/transformers";
import type { MessageCommand } from "@type/commands";

export default {
    name: "profile",
    aliases: ["osu", "mania", "taiko", "fruits"],
    description: "Display statistics of a user.",
    cooldown: 1000,
    run
} satisfies MessageCommand;

async function run({ message, args, commandName, channel }: { message: Message, args: Array<string>, commandName: string, channel: GuildTextChannel }): Promise<void> {
    if (commandName === "profile")
        commandName = Mode.OSU;

    const { user } = parseOsuArguments(message, args, <Mode>commandName);
    if (user.type === UserType.FAIL) {
        await channel.send(user.failMessage);
        return;
    }

    const osuUserRequest = await client.safeParse(client.users.getUser(user.banchoId, { urlParams: { mode: user.mode } }));
    if (!osuUserRequest.success) {
        await channel.send({
            embeds: [
                {
                    type: EmbedType.Rich,
                    title: "Uh oh! :x:",
                    description: `It seems like the user **\`${user.banchoId}\`** doesn't exist! :(`
                }
            ]
        });
        return;
    }
    const osuUser = osuUserRequest.data;

    let capitalUser: CapitalUser | undefined;
    if (user.userDb?.embed_type === EmbedScoreType.Hanami) {
        const { pageProps } = await getStockProfile(osuUser.id);
        capitalUser = pageProps;
    }

    const embeds = profileBuilder({
        type: EmbedBuilderType.PROFILE,
        initiatorId: message.author.id,
        user: osuUser,
        mode: user.mode,
        capitalUser
    });
    await channel.send({ embeds });
}

