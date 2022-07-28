import {FileWriter} from "../file-writer";
import {Brand, guessLinkType} from "../model";
import {Crawler} from "../crawler";

interface VariantType {
    size: number;
    construction: string;
}

class Starboard extends FileWriter<VariantType> {
    constructor(protected crawler: Crawler = new Crawler()) {
        super("Starboard");
    }

    async getBrandInfo(): Promise<Brand> {
        const homePageUrl = "https://windsurf.star-board.com/";

        const infoUrl =
            "https://windsurf.star-board.com/";

        const extract1 = await this.crawler.crawl(infoUrl, () => {
            // Can't use "utils" imports in this "browser" function
            const unique = (value, index, self) => value !== undefined && self.indexOf(value) === index;

            const logo = document.querySelector<HTMLImageElement>(".same-logo img").src;

            const description = document.querySelector<HTMLDivElement>(".widget-info")
                .textContent

            const pictures = Array.from(document.querySelectorAll<HTMLImageElement>("rs-slide img"))
                .map(i => i.src)

            const links = Array.from<HTMLAnchorElement>(document.querySelectorAll(".soc-ico a"))
                .map(a => a.href)
                .filter(unique);

            return {logo, description, pictures, links};
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
            motto: {}
        };
    }
}

(async () => {
    const brandCrawler = new Starboard();

    await brandCrawler.writeBrandFile(
        brandCrawler.getBrandInfo.bind(brandCrawler)
    );
})();
