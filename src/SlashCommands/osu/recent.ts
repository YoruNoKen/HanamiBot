import { ChatInputCommandInteraction } from "discord.js";
import { MyClient } from "../../classes";
import { start } from "../../Helpers/plays";

export async function run({ interaction, client }: { interaction: ChatInputCommandInteraction; client: MyClient }) {
  await interaction.deferReply();
  await start({ isTops: false, interaction, client });
}
export { data } from "../data/recent";
