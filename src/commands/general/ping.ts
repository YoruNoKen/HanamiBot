import { client } from "@utils/initalize";
import type { SlashCommand } from "@type/commands";

export default {
    data: { name: "ping", description: "pong!!" },
    run: async (interaction) => {
        await interaction.deferReply();

        const { ws, rest } = await interaction.client.ping();

        const userId = 17279598;

        const osuStart = new Date().getTime();
        await client.safeParse(client.users.getUser(userId));
        const osuEnd = new Date().getTime();
        const osuDuration = osuEnd - osuStart;

        await interaction.editReply({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\`\nosu! API: \`${osuDuration}ms\``
        });
    }
} satisfies SlashCommand;
