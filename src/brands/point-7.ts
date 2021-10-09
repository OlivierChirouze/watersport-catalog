import {FileWriter} from "../file-writer";
import salt2014 from "./import/Point-7_Salt_2014.json";
import {Crawler} from "../crawler";
import {Brand, guessLinkType} from "../model/brand";

interface VariantType {
    size: number;
}

class Point7 extends FileWriter<VariantType> {
    constructor(protected crawler: Crawler) {
        super("Point-7");
    }

    async getBrandInfo(): Promise<Brand> {
        const homePageUrl = "https://point-7.com/";

        const infoUrl = "https://point-7.com/about-us/";

        const extract1 = await this.crawler.crawl(infoUrl, () => {
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
                // Can't use "utils" imports in this "browser" function
                .filter(
                    (value, index, self) =>
                        value !== undefined && self.indexOf(value) === index
                );

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

    async writeProductFromHandmadeFile(product: any) {
        return this.writeProductFile(product.name, product.year, () => Promise.resolve({
            ...product,
            brandName: this.brandName
        }))
    }
}

(async () => {
    const crawler = await new Crawler().init();
    const brandCrawler = new Point7(crawler);

    await brandCrawler.writeBrandFile(brandCrawler.getBrandInfo.bind(brandCrawler));

    // Manually add Salt 2014
    await brandCrawler.writeProductFromHandmadeFile(salt2014);

    await crawler.close();
})();
