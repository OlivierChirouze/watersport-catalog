import {Crawler} from "../crawler";
import {FileWriter, Parsed} from "../file-writer";
import {extract, onlyUnique, stringToNumber} from "../utils";
import {
    BoardType,
    FinConfig,
    FinFamily,
    Picture,
    ProductSubType,
    ProductType,
    Program,
    WindsurfBoard,
    WindsurfFinBoxType
} from "../model";
import {Brand, guessLinkType} from "../model/brand";

type Extract = {
    data: { [name: string]: { [key: string]: string } };
    pictures: { [name: string]: string };
    description?: string;
};

interface VariantType {
    size: number;
    construction: string;
}

const getFinBoxType = (value: string) => {
    switch (value) {
        case "US 8″":
            return WindsurfFinBoxType.US8;
        case "US 5″":
            return WindsurfFinBoxType.US5;
        case "Deep tuttle":
        case "Deep Foil Box":
            return WindsurfFinBoxType.DeepTuttleBox;
        case "Slot":
            return WindsurfFinBoxType.SlotBox;
        case "Power":
            return WindsurfFinBoxType.PowerBox;
    }

    throw `Fin type not recognized: "${value}"`;
};

class Patrik extends FileWriter<VariantType> {
    constructor(protected crawler: Crawler = new Crawler()) {
        super("Patrik");
    }

    async parse(url: string, modelName: string,
                finFamilies: FinFamily[]): Promise<Parsed<VariantType>> {
        const extracted = await this.crawler.crawl(url, this.extract);

        // Pictures per variation and size
        const images = Object.keys(extracted.pictures).reduce(
            (
                accumulator: { [variation: string]: { [size: number]: string } },
                title: string
            ) => {
                // "qt-wave 68\nGBM" => 68, GBM
                // "qt-wave 73" => 73
                const size =
                    stringToNumber(
                        extract(
                            title,
                            new RegExp(`${modelName.toUpperCase()} +(.*)(\\n[\\s\\S]*|$)`)
                        )
                    ) ?? "*";
                const variation = extract(title, new RegExp(`.*\n(.*)`)) ?? "*";

                accumulator[variation] = accumulator[variation] ?? {};
                accumulator[variation][size] = extracted.pictures[title];

                return accumulator;
            },
            {}
        );

        const uniqueConstructions = new Set<string>();
        const uniqueSizes = new Set<number>();

        //console.debug("Pictures");
        //console.debug(JSON.stringify(images, null, 2));

        const variants = Object.keys(extracted.data).reduce(
            (accumulator: WindsurfBoard<VariantType>[], key: string) => {
                const size = stringToNumber(
                    extract(key, new RegExp(`${modelName.toUpperCase()} (.*)`))
                );

                uniqueSizes.add(size);

                const data = extracted.data[key];

                Object.keys(images).forEach(imageKey => {
                    let construction = imageKey === "*" ? undefined : imageKey;

                    uniqueConstructions.add(construction);

                    const getSubValueOrDefault = construction
                        ? (value: string) =>
                            extract(
                                value,
                                new RegExp(`[\\s\\S]*${imageKey}: (.*)(\n[\\s\\S]*|$)`)
                            ) ?? value
                        : (value: string) => value;

                    const fins = getSubValueOrDefault(data["FIN BOX"])
                        .split(/[\n+]+/)
                        .reduce((accumulator: FinConfig[], value: string) => {
                            if (value.trim() === "") return;

                            // 3xUS 8″
                            // Deep tuttle
                            const count = stringToNumber(extract(value, /(\d+)x.*/) ?? "1");
                            const type = getFinBoxType(extract(value, /\d+x(.*)/) ?? value);

                            accumulator.push({count, type});

                            return accumulator;
                        }, []);

                    const [fromM2, toM2] = (
                        getSubValueOrDefault(data["SAIL\nRANGE\n[M2]"]) ?? ""
                    )
                        .split("-")
                        .map(value => stringToNumber(value));

                    const gearModel: WindsurfBoard<VariantType> = {
                        variant: {
                            construction,
                            size
                        },
                        compatibleFinFamilies: finFamilies,
                        lengthCm:
                            stringToNumber(getSubValueOrDefault(data["LENGTH\n[MM]"])) / 10,
                        widthCm:
                            stringToNumber(getSubValueOrDefault(data["WIDTH\n[MM]"])) / 10,
                        volumeL: stringToNumber(
                            getSubValueOrDefault(data["VOLUME\n[LITRE]"])
                        ),
                        weightKg: stringToNumber(
                            getSubValueOrDefault(data["WEIGHT\n(+/-6%)\n[KG]"])
                        ),
                        // "5×4"
                        strapInsertCount: stringToNumber(
                            (
                                getSubValueOrDefault(data["STRAP\nOPTIONS &\nINSERT HOLES"]) ??
                                ""
                            ).split("×")[0]
                        ),
                        fins,
                        sailRange: {fromM2, toM2}
                    };

                    accumulator.push(gearModel);
                });

                return accumulator;
            },
            []
        );

        const pictures = Object.keys(images).reduce(
            (accumulator: Picture<VariantType>[], construction) => {
                Object.keys(images[construction]).forEach(size => {
                    const url = images[construction][size];
                    accumulator.push({
                        variant: {
                            construction: construction === "*" ? undefined : construction,
                            size: size === "*" ? undefined : stringToNumber(size)
                        },
                        url
                    });
                });
                return accumulator;
            },
            []
        );

        let dimensions: (keyof VariantType)[] = [];

        if (uniqueConstructions.size > 1) dimensions.push("construction");

        if (uniqueSizes.size > 1) dimensions.push("size");

        return {
            pictures,
            dimensions,
            variants,
            description: extracted.description ? {en: extracted.description} : {}
        };
    }

    extract(): Extract {
        // Note: need to keep all code inside this method to work in the browser

        const imageDivs = Array.from(
            document.querySelectorAll("div.avia-image-container")
        );

        const pictures: { [name: string]: string } = {};

        imageDivs.forEach((div: HTMLDivElement) => {
            let legendSection = div.parentElement.querySelector("section");
            if (!legendSection)
                // This is not a picture for the gear, but a random photo
                return;

            const title = legendSection.innerText.toUpperCase();
            pictures[title] = div.querySelector("a").href;
        });

        const tables = Array.from(document.querySelectorAll(".avia-data-table"));

        const data: { [name: string]: { [key: string]: string } } = {};

        tables.forEach(table => {
            const headers = Array.from(
                table.querySelector("tr").querySelectorAll("td")
            ).map((header: HTMLTableDataCellElement) =>
                header.innerText.toUpperCase()
            );

            if (
                headers.includes("LENGTH\n[MM]") ||
                headers.includes("BEST\nSAIL SIZE\n[M2]")
            ) {
                // This is the dimensions or recommendations table

                const lines = Array.from(table.querySelectorAll("tr"));
                // First row is header row
                lines.shift();

                lines.forEach((line: HTMLTableRowElement) => {
                    const name = line.querySelector("th").innerText;
                    data[name] = data[name] ?? {};

                    const cells = Array.from(line.querySelectorAll("td")).map(
                        td => td.innerText
                    );

                    headers.forEach(header => {
                        data[name][header] = cells.shift();
                    });
                });
            }
        });

        // Very basic: paragraphs that have some words!
        const paragraphs = Array.from(document.querySelectorAll("p"))
            .map(p => p.innerText)
            .filter(p => p.length > 100);

        const description = paragraphs.length > 0 ? paragraphs[0] : undefined;

        return {data, pictures, description};
    }

    async getBrandInfo(): Promise<Brand> {
        const homePageUrl = "https://patrik-windsurf.com/";

        const infoUrl = "https://patrik-windsurf.com/philosophy/";
        const extract1 = await this.crawler.crawl(infoUrl, () => {
            const logo = (document.querySelector(
                "span.logo > a > img"
            ) as HTMLImageElement).src;
            const description = (document.querySelector(
                "div.av_one_half:nth-child(1) > section:nth-child(1) > div:nth-child(1) > h3:nth-child(1) > span:nth-child(1)"
            ) as HTMLSpanElement).innerText;
            const moto = (document.querySelector(
                "div.av_one_half:nth-child(1) > section:nth-child(1) > div:nth-child(1) > h2:nth-child(2) > span:nth-child(1) > strong:nth-child(1)"
            ) as HTMLSpanElement).innerText
                .replace("“", "")
                .replace("”", "");
            const picture = (document.querySelector(
                ".avia-builder-el-4 > div:nth-child(1) > img:nth-child(1)"
            ) as HTMLImageElement).src;

            return {logo, description, motto: moto, pictures: [picture]};
        });

        const links = await this.crawler.crawl(
            "https://patrik-windsurf.com/follow-patrik/",
            () => {
                return (
                    Array.from(document.querySelectorAll("a"))
                        .filter(a => a.href.match("patrik-windsurf.com") == undefined)
                        .map((a: HTMLAnchorElement) => a.href)
                        .filter(onlyUnique)
                );
            }
        );

        const brand: Brand = {
            name: this.brandName,
            logo: extract1.logo,
            links: links
                .map(l => ({
                    url: l,
                    type: guessLinkType(l)
                }))
                .filter(l => l.type !== undefined),
            motto: {en: extract1.motto},
            pictures: extract1.pictures,
            description: {en: extract1.description},
            infoUrl,
            homePageUrl
        };

        return brand;
    }

    async createModelFileFromUrl(
        url: string,
        modelName: string,
        year: number,
        type: ProductType,
        subType: ProductSubType,
        programs: Program[],
        finFamilies: FinFamily[]
    ) {
        await this.writeProductFile(
            modelName,
            year,
            this.getProductDescription(
                url,
                modelName,
                year,
                type,
                subType,
                programs,
                finFamilies
            )
        );
    }

    getProductDescription(
        url: string,
        modelName: string,
        year: number,
        type: ProductType,
        subType: ProductSubType,
        programs: Program[],
        finFamilies: FinFamily[]
    ) {
        return async () => {
            try {
                const {
                    dimensions,
                    variants,
                    description,
                    pictures
                } = await this.parse(url, modelName,
                    finFamilies);
                return {
                    dimensions,
                    brandName: this.brandName,
                    year,
                    name: modelName,
                    type,
                    subType,
                    infoUrl: url,
                    programs,
                    variants,
                    description,
                    pictures
                };
            } catch (e1) {
                console.error(`Error parsing ${url}:`);
                console.error(e1);
            }
        };
    }
}

(async () => {
    const brandCrawler = new Patrik();

    await brandCrawler.writeBrandFile(
        brandCrawler.getBrandInfo.bind(brandCrawler)
    );

    await brandCrawler.createModelFileFromUrl(
        "https://patrik-windsurf.com/qt-wave/",
        "qt-wave",
        2019,
        ProductType.board,
        BoardType.windsurfBoard,
        [Program.wave],
        [FinFamily.fins]
    );
    await brandCrawler.createModelFileFromUrl(
        "https://patrik-windsurf.com/qt-wave-2/",
        "qt-wave",
        2021,
        ProductType.board,
        BoardType.windsurfBoard,
        [Program.wave],
        [FinFamily.fins]
    );
    await brandCrawler.createModelFileFromUrl(
        "https://patrik-windsurf.com/foil-style/",
        "foil-style",
        2021,
        ProductType.board,
        BoardType.windsurfBoard,
        [Program.freeride],
        [FinFamily.foil]
    );
    await brandCrawler.createModelFileFromUrl(
        "https://patrik-windsurf.com/air-style-2/",
        "air-style",
        2021,
        ProductType.board,
        BoardType.windsurfBoard,
        [Program.freestyle],
        [FinFamily.fins]
    );

    await brandCrawler.loadImportFiles()
})();
