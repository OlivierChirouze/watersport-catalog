import { FileWriter } from "../file-writer";
import { Brand, guessLinkType } from "../model";
import { Crawler } from "../crawler";

interface VariantType {
  size: number;
  construction: string;
}

class GunSails extends FileWriter<VariantType> {
  constructor(protected crawler: Crawler = new Crawler()) {
    super("Gun Sails");
  }

  async getBrandInfo(): Promise<Brand> {
    const homePageUrl = "https://gunsails.com/";

    // TODO french and german versions
    const infoUrl = "https://gunsails.com/en/why-gunsails";

    const extract1 = await this.crawler.crawl(infoUrl, () => {
      // Can't use "utils" imports in this "browser" function
      const unique = (value, index, self) =>
        value !== undefined && self.indexOf(value) === index;

      const logo = document.querySelector<HTMLImageElement>("a.logo img").src;

      const description = Array.from(
        document.querySelectorAll(".widget-html p")
      )
        .map(p => p.firstChild)
        .filter(e => e !== null && e?.nodeName !== "A")
        .map((e: HTMLParagraphElement) => e.textContent)
        .join("\n\n");

      const pictures = Array.from(
        document.querySelectorAll<HTMLImageElement>(".col-lg-12 img")
      ).map(i => i.src);

      const links = Array.from<HTMLAnchorElement>(
        document.querySelectorAll(".social-links a")
      )
        .map(a => a.href)
        .filter(unique);

      return { logo, description, pictures, links };
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
      description: { en: extract1.description },
      infoUrl,
      homePageUrl,
      motto: {}
    };
  }
}

(async () => {
  const brandCrawler = new GunSails();

  await brandCrawler.writeBrandFile(
    brandCrawler.getBrandInfo.bind(brandCrawler)
  );
})();
