import {FileWriter} from "../file-writer";
import {Brand, guessLinkType} from "../model/brand";
import {Crawler} from "../crawler";

interface VariantType {
  size: number;
  construction: string;
}

class Fanatic extends FileWriter<VariantType> {
  constructor(protected crawler: Crawler = new Crawler()) {
    super("Fanatic");
  }

  async getBrandInfo(): Promise<Brand> {
    const homePageUrl = "https://www.fanatic.com";

    // TODO french and german versions
    const infoUrl =
        "https://www.fanatic.com/windsurf/our-world/about-us/the-brand";

    const extract1 = await this.crawler.crawl(infoUrl, () => {
      const logoLink = document.querySelector(".logo-small") as HTMLDivElement;

      const logo = window
          .getComputedStyle(logoLink, null)
          .backgroundImage.slice(4, -1)
          .replace(/"/g, "");

      const motto = (document.querySelector(
          ".page-product-wrap > h2:nth-child(2)"
      ) as HTMLHeadingElement).innerText;

      const description =
          (document.querySelector(".text-center") as HTMLDivElement).innerText +
          (document.querySelector(
              "html body div.page-wrap div.page-content section.page.frame-default div.container div.two-text-column-banner"
          ) as HTMLDivElement).innerText;

      const picture = (document.querySelector(
          ".full-page-banner > img:nth-child(1)"
      ) as HTMLImageElement).src;

      const links = Array.from(
          document.querySelectorAll(".footer__social-buttons > a")
      )
          .map((a: HTMLAnchorElement) => a.href)
          // Can't use "utils" imports in this "browser" function
          .filter(
              (value, index, self) =>
                  value !== undefined && self.indexOf(value) === index
          );

      return {logo, description, pictures: [picture], motto, links};
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
      homePageUrl,
      motto: {en: extract1.motto}
    };
  }
}

(async () => {
  const brandCrawler = new Fanatic();

  await brandCrawler.writeBrandFile(
      brandCrawler.getBrandInfo.bind(brandCrawler)
  );

  await brandCrawler.loadImportFiles();
})();
