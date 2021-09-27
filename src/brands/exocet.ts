import {Crawler} from "../crawler";
import {Activity, GearType, Program, WindsurfBoard, WindsurfFinBoxType} from "../model";
import {Parsed, Scraper} from "../scraper";
import {extract, stringToNumber} from "../utils";
import {Brand, guessLinkType} from "../model/brand";

type Extract = {
    data: { [name: string]: { [key: string]: string } };
    pictureUrl: string;
    description: string;
};

const getFinBoxType = (value: string) => {
    switch (value.toUpperCase()) {
        case "DEEP TUTTLE BOX (FOIL COMPATIBLE)":
            return WindsurfFinBoxType.DeepTuttleBox;
    }

    throw `Fin type not recognized: ${value}`;
};

interface VariantType {
    size: string;
}

class Exocet extends Scraper<VariantType> {
    constructor(protected crawler: Crawler) {
        super("Exocet");
    }

    extract(): Extract {
        // Note: need to keep all code inside this method to work in the browser

        const pictureUrl = (document.querySelector(
            "img.imgmain"
        ) as HTMLImageElement).src;

        const description = (document.querySelector(
            ".c-app-product-tabs__panes > div[tab-index=tab0]"
        ) as HTMLDivElement).innerText;

        const table = document.querySelector(
            "div[tab-index=tab1] > table"
        ) as HTMLTableElement;

        const headers = Array.from(table.querySelector("tr").querySelectorAll("td"))
            .map((header: HTMLTableDataCellElement) => header.innerText.toUpperCase())
            .filter(td => td !== "");

        const lines = Array.from(table.querySelectorAll("tr"));
        // First row is header row
        lines.shift();

        const data = lines.reduce(
            (
                accumulator: { [name: string]: { [key: string]: string } },
                line: HTMLTableRowElement
            ) => {
                const cells = Array.from(line.querySelectorAll("td")).map(td =>
                    td.innerText.toUpperCase()
                );
                // First column is name
                const name = cells.shift();
                accumulator[name] = {};

                headers.forEach(header => (accumulator[name][header] = cells.shift()));

                return accumulator;
            },
            {}
        );

        return {data, pictureUrl, description};
    }

    async parse(url: string, modelName: string): Promise<Parsed<VariantType>> {
        const extracted = await this.crawler.crawl(url, this.extract);

        const description = {en: extracted.description};

        const variants = Object.keys(extracted.data).reduce(
            (accumulator: WindsurfBoard<VariantType>[], name: string) => {
                const data = extracted.data[name];

                const [fromM2, toM2] = extract(data["SAILS RANGE"], /(.*) M2/)
                    .split(" - ")
                    .map(value => stringToNumber(value));

                const size = extract(
                    name,
                    new RegExp(`${modelName.toUpperCase()} (.*)`)
                );
                const gearModel: WindsurfBoard<VariantType> = {
                    variant: {size},
                    lengthCm: stringToNumber(extract(data["LENGTH"], /(.*) CM/)),
                    widthCm: stringToNumber(extract(data["WIDTH"], /(.*) CM/)),
                    volumeL: stringToNumber(extract(data["VOLUME"], /(.*) LITRES/)),
                    weightKg: stringToNumber(extract(data["WEIGHT"], /(.*) KG/)),
                    fins: [{count: 1, type: getFinBoxType(data["BOX"])}],
                    sailRange: {fromM2, toM2}
                };

                accumulator.push(gearModel);
                return accumulator;
            },
            []
        );

        return {
            dimensions: ["size"],
            variants,
            description,
            pictures: [{variant: {}, url: extracted.pictureUrl}]
        };
    }

    protected async getBrandInfo(): Promise<Brand> {
        const homePageUrl = "https://www.exocet-original.fr/";

        // TODO french version
        //const infoUrl = 'https://www.exocet-original.fr/a-propos';
        const infoUrl = 'https://www.exocet-original.com/PBCPPlayer.asp?ID=2066945';

        const extract1 = await this.crawler.crawl(infoUrl, () => {

            const logo = (document.querySelector("div.header-logo > * > img") as HTMLImageElement).src;

            const description = (document.querySelector("div.ox-margin-top-large > div:nth-child(1)") as HTMLDivElement).innerText;

            const picture = (document.querySelector(".ambassador-img > img:nth-child(1)") as HTMLImageElement).src;

            const links = Array.from(document.querySelectorAll(".links__item--facebook > a, .links__item--instagram > a, .links__item--youtube > a"))
                .map((a: HTMLAnchorElement) => a.href)
                // Can't use "utils" imports in this "browser" function
                .filter((value, index, self) => value !== undefined && self.indexOf(value) === index);

            return {logo, description, pictures: [picture], links}

        });

        const brand: Brand = {
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
        }

        return brand;
    }
}

(async () => {
    const crawler = await new Crawler().init();
    const brandCrawler = new Exocet(crawler);

    await brandCrawler.createBrandFile();

    // TODO load french description from https://www.exocet-original.fr/freefoil-ast-c2x29552596
    // TODO support 2 urls for the "same" board: Freefoil AST and Freefoil Carbone
    await brandCrawler.createModelFileFromUrl(
        "https://www.exocet-original.com/freefoil-ast-c2x33091951",
        "Freefoil",
        2019,
        [Activity.windfoil],
        GearType.windsurfBoard,
        [Program.freeride]
    );

    await crawler.close();
})();
