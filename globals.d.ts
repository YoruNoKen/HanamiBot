declare module "bun" {
    interface Env {
        DISCORD_BOT_TOKEN: string;
        ACCESS_TOKEN: string;
        CLIENT_SECRET: string;
        CLIENT_ID: string;
        CALLBACK_URL: string;
        TURSO_URL: string;
        TURSO_TOKEN: string;
        KEY?: string;
        IV?: string;
    }
}

declare module "*.db" {
    var db: import("bun:sqlite").Database;
    export = db;
}
