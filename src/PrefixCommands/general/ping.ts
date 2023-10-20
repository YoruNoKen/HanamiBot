import { Message } from "discord.js";

export const name = "ping";
export const aliases = ["ping", "p"];
export const cooldown = 3000;

export async function run({ message }: { message: Message }) {
  const timeNow = Date.now();
  const response = await message.reply(`Pong! 🏓`);
  const ms = Date.now() - timeNow;
  response.edit(`Pong! 🏓(${ms}ms)`);
}
