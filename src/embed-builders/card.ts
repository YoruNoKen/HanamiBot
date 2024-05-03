import puppeteer from "puppeteer";
import type { CardBuilderOptions } from "@type/embedBuilders";
import type { ReplyOptions } from "@lilybird/transformers";

export async function cardBuilder({ user }: CardBuilderOptions): Promise<ReplyOptions> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const { username } = user;
    const params = `username=${username}`;

    const url = `https://fun.yorunoken.com/card?${params}`;
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 800, height: 600 });

    const screenshotBuffer = await page.screenshot({
        fullPage: false,
        type: "png"
    });

    await browser.close();

    return {
        content: `User card for ${username}`,
        // @ts-expect-error TypeScript thinks blob is incorrect type but it is.
        files: [ { file: new Blob([screenshotBuffer], { type: "image/png" }), name: `${username}.png` } ]
    };
}