import {Parsed, Scraper} from "../scraper";
import salt2014 from "./handmade-definitions/Point-7_Salt_2014.json";
import {Crawler} from "../crawler";
import {Brand, guessLinkType} from "../model/brand";

interface VariantType {
  size: number;
}

class Point7 extends Scraper<VariantType> {
  constructor(protected crawler: Crawler) {
    super('Point-7');
  }

  protected async getBrandInfo(): Promise<Brand> {
    const homePageUrl = "https://point-7.com/";

    const infoUrl = 'https://point-7.com/about-us/';

    const extract1 = await this.crawler.crawl(infoUrl, () => {
      const logo = (document.querySelector('#logo > * > img') as HTMLImageElement).src;

      const description =
          (document.querySelector('header > div.lead') as HTMLDivElement).innerText

      const picture = (document.querySelector('.img-inner > img') as HTMLImageElement).src;

      const links = Array.from(document.querySelectorAll('.header-social-icons > * > a'))
          .map((a: HTMLAnchorElement) => a.href)
          // Can't use "utils" imports in this "browser" function
          .filter((value, index, self) => value !== undefined && self.indexOf(value) === index);

      return {logo, description, pictures: [picture], links}
    });

    return {
      name: this.brandName,
      logo: extract1.logo,
      links: extract1.links.map(l => ({
        url: l,
        type: guessLinkType(l)
      })).filter(l => l.type !== undefined),
      pictures: extract1.pictures,
      description: {en: extract1.description},
      infoUrl,
      homePageUrl
    };
  }

  async parse(url: string, modelName: string): Promise<Parsed<VariantType>> {
    return Promise.resolve(undefined);
  }
}

(async () => {
  const crawler = await new Crawler().init();
  const brandCrawler = new Point7(crawler);

  await brandCrawler.createBrandFile();

  // Manually add Salt 2014
  await brandCrawler.createModelFileFromJson(salt2014);

  await crawler.close();
})();
