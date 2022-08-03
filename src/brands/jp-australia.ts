import { FileWriter } from "../file-writer";
import { Brand, guessLinkType } from "../model";
import { Crawler } from "../crawler";

interface VariantType {
  size: number;
  construction: string;
}

class JPAustralia extends FileWriter<VariantType> {
  constructor(protected crawler: Crawler = new Crawler()) {
    super("JP Australia");
  }

  async getBrandInfo(): Promise<Brand> {
    const homePageUrl = "https://jp-australia.com/";

    const infoUrl = "https://jp-australia.com/who-we-are/";

    const extract1 = await this.crawler.crawl(infoUrl, () => {
      // Can't use "utils" imports in this "browser" function
      const unique = (value, index, self) =>
        value !== undefined && self.indexOf(value) === index;

      const logo = document.querySelector<HTMLImageElement>(
        ".mega-menu-logo-mobile"
      ).src;

      const description = Array.from(
        document.querySelectorAll<HTMLDivElement>(
          ".wpb_text_column.wpb_content_element"
        )
      )
        .map(e => e.textContent)
        .join("\n\n");

      const pictures = Array.from(
        document.querySelectorAll<HTMLImageElement>(".vc_single_image-img")
      ).map(i => i.src);

      const links = Array.from<HTMLAnchorElement>(
        document.querySelectorAll(".footer-social-media-links a")
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
  const brandCrawler = new JPAustralia();

  await brandCrawler.writeBrandFile(
    brandCrawler.getBrandInfo.bind(brandCrawler)
  );
})();
