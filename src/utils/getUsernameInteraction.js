const { query } = require("./getQuery.js");

async function getUsername(interaction) {
  const now = Date.now();
  let user = interaction.options.getString("user");
  const regex = /^<@\d+>$/;
  if (regex.test(user)) {
    const userID = user.match(/\d+/)[0];
    try {
      const res = await query({ query: `SELECT value FROM users WHERE id = ${userID}`, type: "get", name: "value" });
      user =
        res.BanchoUserId ??
        (() => {
          throw new Error("no userarg");
        })();
    } catch (err) {
      await interaction.reply({ ephmeral: true, content: "The discord user you have provided does not have an account linked." });
      return false;
    }
  }
  if (!user) {
    try {
      const res = await query({ query: `SELECT value FROM users WHERE id = ${interaction.user.id}`, type: "get", name: "value" });
      user =
        res.BanchoUserId ??
        (() => {
          throw new Error("no userarg");
        })();
    } catch (err) {
      await interaction.reply({ ephmeral: true, content: "Either specify a username, or connect your account using </link:1106913256339148911>" });
      return false;
    }
  }

  return user;
}

module.exports = { getUsername };
