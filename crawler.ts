import puppeteer, {Browser, EvaluateFn} from 'puppeteer'

export class Crawler {
  private browser: Browser;

  async init() {
    this.browser = await puppeteer.launch();
    return this;
  }

  async crawl<T extends EvaluateFn>(url: string, extractor: T) {
    const page = await this.browser.newPage();

    await page.goto(url);

    return await page.evaluate(extractor);
  }

  async close() {
    await this.browser.close();
  }
}

// let url = "https://windsurf.star-board.com/products/isonic/";
// let url = "https://patrik-windsurf.com/qt-wave/";

(async () => {
  const crawler = await new Crawler().init();

  await crawler.close();
})();


