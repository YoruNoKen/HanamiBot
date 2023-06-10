const { query } = require("./getQuery.js");

async function getUsername(message, args) {
  const now = Date.now();

  const unOsu = ["-mania", "-osu", "-fruits", "-taiko"];
  const unAllowed = ["-p", "-page", "-index", "-i"];
  args = args.filter((arg) => !unOsu.includes(arg));
  args = args.filter((arg, index) => {
    if (unAllowed.includes(arg)) {
      args.splice(index, index + 1);
      return false;
    }
    if (arg.match(/=.*/)) {
      return false;
    }
    if (arg.match(/^\+.*/)) {
      return false;
    }
    return true;
  });

  const argsJoined = args.join(" ");
  let user;
  user = await getByTag(argsJoined);
  if (user) {
    return user;
  }

  user = await getByID(argsJoined);
  if (user) {
    return user;
  }

  user = await getByString(argsJoined, message);
  if (user) {
    return user;
  }

  message.channel.send("**Either specify a username, or link your osu!bancho account using </link:1106913256339148911>**");
  return false;
}

async function getByTag(user) {
  const regex = /<@(\d+)>/;
  const match = user.match(regex);
  if (match) {
    const userID = match[1];
    const res = await query({ query: `SELECT value FROM users WHERE id = ${userID}`, type: "get", name: "value" });
    return res?.BanchoUserId;
  }
  return undefined;
}

async function getByID(user) {
  const regex = /.*(\d{17,}).*/;
  if (regex.test(user)) {
    const userID = user.match(/\d+/)[0];
    const res = await query({ query: `SELECT value FROM users WHERE id = ${userID}`, type: "get", name: "value" });
    return res?.BanchoUserId;
  }
  return undefined;
}

async function getByString(user, message) {
  if (!user || user.length === 0) {
    const userID = message.author.id;
    const res = await query({ query: `SELECT value FROM users WHERE id = ${userID}`, type: "get", name: "value" });
    return res?.BanchoUserId;
  }

  user = user.replace(/["']/g, "");
  return user;
}

module.exports = { getUsername };
