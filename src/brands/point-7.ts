import {FileWriter} from "../file-writer";
import {Crawler} from "../crawler";
import {Brand, guessLinkType} from "../model/brand";

interface VariantType {
  size: number;
}

class Point7 extends FileWriter<VariantType> {
  constructor(protected crawler: Crawler = new Crawler()) {
    super("Point-7");
  }

  async getBrandInfo(): Promise<Brand> {
    const homePageUrl = "https://point-7.com/";

    const infoUrl = "https://point-7.com/about-us/";

    const extract1 = await this.crawler.crawl(infoUrl, () => {
      // Can't use "utils" imports in this "browser" function
      const unique = (value, index, self) => value !== undefined && self.indexOf(value) === index;

      const logo = (document.querySelector(
          "#logo > * > img"
      ) as HTMLImageElement).src;

      const description = (document.querySelector(
          "header > div.lead"
      ) as HTMLDivElement).innerText;

      const picture = (document.querySelector(
          ".img-inner > img"
      ) as HTMLImageElement).src;

      const links = Array.from(
          document.querySelectorAll(".header-social-icons > * > a")
      )
          .map((a: HTMLAnchorElement) => a.href)
          .filter(unique);

      return {logo, description, pictures: [picture], links};
    });

    return {
      name: this.brandName,
      logo: extract1.logo,
      links: extract1.links
          .map(l => ({
            url: l,
            type: guessLinkType(l)
          }))
          .filter(l => l.type !== undefined),
      pictures: extract1.pictures,
      description: {en: extract1.description},
      infoUrl,
      homePageUrl
    };
  }
}

(async () => {
  const brandCrawler = new Point7();

  await brandCrawler.writeBrandFile(
      brandCrawler.getBrandInfo.bind(brandCrawler)
  );
})();
