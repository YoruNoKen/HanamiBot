const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

// importing top
const { GetUserTop } = require("../exports/top_export.js");
const { FindUserargs } = require("../exports/finduserargs_export.js");

function getTop(message, args, prefix, RB, mode, RuleSetID) {
	fs.readFile("./user-data.json", async (error, data) => {
		if (error) {
			console.log(error);
			return;
		}
		const userData = JSON.parse(data);

		let argValues = {};
		for (const arg of args) {
			const [key, value] = arg.split("=");
			argValues[key] = value;
		}

		function parseArgs(args) {
			const result = {};

			result.pageNumber = 1;
			result.playNumber = undefined;
			result.server = userData[message.author.id]?.server || "bancho";

			if (args.includes("-i")) {
				result.playNumber = args[args.indexOf("-i") + 1];
			}

			if (args.includes("-p")) {
				result.pageNumber = args[args.indexOf("-p") + 1];
				if (result.pageNumber > 20) {
					throw new Error("Value must not be greater than 20");
				}
			}

			if (args.includes("-bancho")) {
				result.server = "bancho";
			}

			if (args.includes("-gatari")) {
				result.server = "gatari";
			}

			return result;
		}

		const options = parseArgs(args);
		var playNumber = options.playNumber;
		var pageNumber = options.pageNumber;
		var server = options.server;

		var userArgs = await FindUserargs(message, args, server, prefix);

		if (
			args.join(" ").startsWith("-page") ||
			args.join(" ").startsWith("-p") ||
			args.join(" ").startsWith("-r") ||
			args.join(" ").startsWith("-recent") ||
			args.join(" ").startsWith("-i") ||
			args.join(" ").startsWith("mods") ||
			args.join(" ").startsWith("+") ||
			args.join(" ").startsWith("-g") ||
			args.join(" ").startsWith("-am") ||
			args.join(" ").startsWith("-amount") ||
			args.join(" ").startsWith("-rev") ||
			args.join(" ").startsWith("-reverse")
		) {
			try {
				if (server == "bancho") userArgs = userData[message.author.id].BanchoUserId;
				if (server == "gatari") userArgs = userData[message.author.id].GatariUserId;
			} catch (err) {
				message.reply({
					embeds: [new EmbedBuilder().setColor("Purple").setDescription(`Set your osu! username by typing "${prefix}link **your username**"`)],
				});
			}
		}

		let user, userstats;
		if (server == "bancho") {
			const headers = {
				Authorization: `Bearer ${process.env.osu_bearer_key}`,
			};
			const baseURL = `https://osu.ppy.sh/api/v2`;

			const [userResponse, scoreResponse] = await Promise.all([
				fetch(`${baseURL}/users/${userArgs}/${mode}`, { headers }).then(response => response.json()),
				fetch(`${baseURL}/users/${userArgs}/scores/best?mode=${mode}&limit=100&offset=0`, { headers }).then(response => response.json()),
			]);
			user = userResponse || {};
			score = scoreResponse || [];

			if (!user) {
				message.reply({
					embeds: [new EmbedBuilder().setColor("Purple").setDescription(`**The player \`${userArgs}\` does not exist in Bancho database**`)],
				});
				return;
			}

			if (score.length === 0) {
				message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No Bancho plays found for **${user.username}**`)] });
				return;
			}
		}

		if (server == "gatari") {
			const baseURL = `https://api.gatari.pw`;
			const [userResponse, userStatsResponse] = await Promise.all([
				fetch(`${baseURL}/users/get?u=${userArgs}`).then(response => response.json()),
				fetch(`${baseURL}/user/stats?u=${userArgs}&${RuleSetID}`).then(response => response.json()),
			]);

			user = userResponse.users[0];
			userstats = userStatsResponse.stats;

			const scoreResponse = await fetch(`${baseURL}/user/scores/best?id=${user.id}&l=100&p=1&mode=${RuleSetID}`, { method: "GET" }).then(response =>
				response.json(),
			);
			score = scoreResponse.scores ?? null;
			if (!user) {
				message.reply({
					embeds: [new EmbedBuilder().setColor("Purple").setDescription(`**The player \`${userArgs}\` does not exist in Gatari database**`)],
				});
				return;
			}

			if (!score) {
				message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No Gatari plays found for **${user.username}**`)] });
				return;
			}
		}

		if (args.includes("-am") || args.includes("-g") || args.join(" ").includes("-amount")) {
			let query = "";
			args.forEach((arg, index) => {
				switch (arg) {
					case "-am":
					case "-amount":
					case "-g":
						query = arg;
						break;
					default:
						break;
				}
			});

			const numberIndex = Number(args[args.indexOf(query) + 1]);

			const numberBigger = score.filter(x => x.pp > numberIndex);

			const embed = new EmbedBuilder()
				.setColor("Purple")
				.setDescription(`${user.username} has **\`${numberBigger.length}\`** plays worth more than ${numberIndex.toFixed(1)}PP`)
				.setFooter({ text: `osu!${server}` });

			message.channel.send({ embeds: [embed] });
			return;
		}

		if (args.includes("-r") || args.includes("-recent")) RB = true;

		message.channel.send({
			embeds: [await GetUserTop(score, user, userstats, pageNumber, mode, RuleSetID, args, argValues["mods"], playNumber, RB, server)],
		});
	});
}

module.exports = { getTop };
