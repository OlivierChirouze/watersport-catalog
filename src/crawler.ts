import puppeteer, {Browser, EvaluateFn} from "puppeteer";

export class Crawler {
    private browser: Browser;

    async init() {
        const isDebug = process.argv[2] === "debug" || process.argv[3] === "debug"

        this.browser = await puppeteer.launch(isDebug ? {devtools: true, headless: false} : undefined);
        return this;
    }

    async crawl<T extends EvaluateFn>(url: string, extractor: T) {
        if (!this.browser) {
            await this.init()
        }

        const page = await this.browser.newPage();

        const response = await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 10000
        });
        if (!response.ok()) {
            throw new Error(`Page not found ${url}`);
        }

        // Slowly scroll the page to make sure all content is loaded.
        // Note: can't use a proper promise to wait because of typescript code not properly interpreted by Puppeteer
        // => a combination of individual evaluate + wait do the trick
        for (let i = 0; i < 20; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, document.body.scrollHeight / 20);
            });
            await page.waitForTimeout(500)
        }

        return await page.evaluate(extractor);
    }

    async close() {
        await this.browser?.close();
    }
}
