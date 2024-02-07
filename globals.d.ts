declare namespace NodeJS {
    interface ProcessEnv {
    DISCORD_BOT_TOKEN: string;
    CLIENT_SECRET: string;
    CLIENT_ID: string;
    CALLBACK_URL: string;
}
}

declare module "*.db" {
    var db: import("bun:sqlite").Database;
    export = db;
}
