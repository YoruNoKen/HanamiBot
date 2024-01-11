import type { Message } from "lilybird";
import type { MessageCommand } from "@lilybird/handlers";

async function run(message: Message): Promise<void> {
    await message.reply("This command has been deprecated. Use `/link` instead.");
}

export default {
    name: "link",
    alias: ["osu", "mania", "taiko", "ctb"],
    run: async (message, args) => {
        //
    }
} satisfies MessageCommand;
