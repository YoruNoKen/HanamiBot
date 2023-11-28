import { Message } from "discord.js";
import { MyClient } from "../../classes";
import { start } from "../../Helpers/osu";
import { osuModes } from "../../types";

export const name = "osu";
export const aliases = ["osu", "mania", "taiko", "catch"];
export const cooldown = 3000;
export const description = `Get information of an osu! player.`;

export async function run({ message, args, commandName, client }: { message: Message; args: string[]; commandName: osuModes; client: MyClient }) {
  await message.channel.sendTyping();
  await start(message, client, args, commandName);
}
