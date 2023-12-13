import { updatePrefixCache } from "../cache";
import { defaultPrefix } from "../constants";
import { getServer, insertData, Interactionhandler } from "../utils";
import type { Locales } from "../Structure";
import type { ChatInputCommandInteraction, Message } from "discord.js";

const commands: Record<string, Function> = {
    add: addPrefix,
    remove: removePrefix,
    list
};

const MAX_PREFIXES = 10;
export async function start({ interaction, args, locale }: { interaction: Message | ChatInputCommandInteraction, args?: Array<string>, locale: Locales }) {
    const options = Interactionhandler(interaction, args);
    const subcommand = options.subcommand || getsubCommand(args?.join("")!);
    if (!subcommand)
        return options.reply(locale.embeds.prefix.provideFlags);

    const prefix = args ? args.filter((arg) => arg.toLowerCase() !== subcommand) : options.prefix;

    commands[subcommand]({ options, prefix, locale });
}

const getsubCommand = (content: string) => (/add|remove|list/i).exec(content
    .toLowerCase())?.[0]
    ?.toLowerCase();

async function addPrefix({ options, prefix, locale }: { options: any, prefix: string, locale: Locales }) {
    const { guildId } = options;

    const data = JSON.parse(getServer(guildId).data);
    const documentPrefixes: Array<string> | undefined = data.prefix;

    if (documentPrefixes && documentPrefixes.includes(prefix))
        return await options.reply(locale.embeds.prefix.prefixAlreadySet(`\`${prefix}\``));

    if (documentPrefixes && documentPrefixes.length >= MAX_PREFIXES)
        return await options.reply(locale.embeds.prefix.maxPrefix(`\`${MAX_PREFIXES}\``));

    const prefixesArray = documentPrefixes ? [...documentPrefixes, prefix] : [prefix];

    data.prefix = prefixesArray;

    insertData({ table: "servers", id: guildId, data: JSON.stringify(data) });
    updatePrefixCache(data.prefix, guildId);

    return await options.reply(locale.embeds.prefix.prefixAdded(`\`${prefix}\``));
}

async function removePrefix({ options, prefix, locale }: { options: any, prefix: string, locale: Locales }) {
    const guildId = options.guildId!;

    const data = JSON.parse(getServer(guildId).data);

    const documentPrefixes: Array<string> | undefined = data.prefix;

    if (!documentPrefixes)
        return await options.reply(locale.embeds.prefix.noPrefixes);

    if (!documentPrefixes.includes(prefix))
        return await options.reply(locale.embeds.prefix.serverDoesntHavePrefix);

    const prefixesArray = documentPrefixes.filter((item) => !item.includes(prefix));
    data.prefix = prefixesArray.length > 0 ? prefixesArray : undefined;

    insertData({ table: "servers", id: guildId, data: JSON.stringify(data) });
    updatePrefixCache(data.prefix, guildId);

    return await options.reply(locale.embeds.prefix.prefixRemoved(`\`${prefix}\``));
}

async function list({ options, prefix, locale }: { options: any, prefix: string, locale: Locales }) {
    const guildId = options.guildId!;

    const data = JSON.parse(getServer(guildId).data);
    const prefixes: Array<string> = data.prefix || [defaultPrefix];

    return await options.reply(locale.embeds.prefix.currentPrefixes(`\`${prefixes.join(", ")}\``));
}
