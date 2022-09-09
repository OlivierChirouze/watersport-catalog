import { Brand, guessLinkType } from "../model/brand";
import { Crawler } from "../crawler";
import {
  MastType,
  Picture,
  ProductSubType,
  ProductType,
  Program,
  PropulsionType,
  WindsurfSail,
  WindsurfSailTopType
} from "../model";
import { FileWriter, Parsed } from "../file-writer";
import {
  filteredStringToNumberArray,
  split,
  stringToNumber,
  stringToNumberArray
} from "../utils";

interface Spec {
  title: string;
  specs: { [key: string]: string };
}

interface VariantType {
  size: number;
  color?: string;
  construction?: string;
}

const getTopType = (val: string) => {
  switch (val) {
    case "VARIO":
    case "VARIO TOP":
      return WindsurfSailTopType.vario;
    case "FIXED HEAD":
      return WindsurfSailTopType.fixed;
    case "TBC":
    case undefined:
      return undefined;
  }

  throw `Unrecognized top type: ${val}`;
};

const getMastType = (val: string) => {
  switch (val) {
    case "RDM":
      return MastType.RDM;
    case "SDM":
      return MastType.SDM;
  }

  throw `Unrecognized mast type: ${val}`;
};

interface Extract {
  pictures: string[];
  variants: { name: string; color?: string; construction?: string }[];
  data: { [key: string]: string }[];
  description: string;
  dimensions: string[];
  weightVariants: string[];
}

type ProductInfo = { [key: string]: { name: string; programs: Program[] } };

class Neilpryde extends FileWriter<VariantType> {
  constructor(protected crawler: Crawler = new Crawler()) {
    super("Neilpryde");
  }

  extract(): Extract {
    const modelName = document.querySelector<HTMLHeadingElement>("h1")
      .innerText;

    // Note: need to keep all code inside this method to work in the browser
    const description = document.querySelector<HTMLDivElement>(
      ".ProductMeta__Description > div"
    ).innerText;
    const table = document.querySelector<HTMLTableElement>("table.tablepress");

    if (table === null || table === undefined) throw "Table not found";

    const headers = Array.from(
      table.querySelectorAll<HTMLTableDataCellElement>("th")
    ).map(h => h.innerText);

    const variantsDiv = Array.from(
      document.querySelectorAll<HTMLDivElement>(
        ".ProductForm__Option--labelled"
      )
    ).find(div => div.innerText.startsWith("Color"));

    const variants =
      variantsDiv === null || variantsDiv === undefined
        ? []
        : Array.from(variantsDiv.querySelectorAll<HTMLLIElement>("li"))
            .map(li => li.innerText)
            .map(text => {
              const color = text.replace(/(C[0-9]+)/, "$1");

              // "Atlas Pro C1" => "Pro"
              // "Proc C2" => "Pro"
              // "C3(HD)" => HD
              const construction = text
                .replace(/C[0-9]+/, "")
                .replace(/[()]/, "")
                .replace(modelName, "");

              return {
                name: text,
                color: color === "" ? undefined : color,
                construction: construction === "" ? undefined : construction
              };
            });

    const dimensions = variants.map(v => v.color);

    const pictures = Array.from(
      document.querySelectorAll<HTMLImageElement>(".flickity-viewport img")
    ).map(img => img.getAttribute("data-original-src"));

    const lines = Array.from(table.querySelectorAll("tr"));

    // First row is header row
    lines.shift();

    const weightVariants = headers
      .find(header => header.match(/WEIGHT/))
      ?.split(" / ")
      ?.map(h =>
        h
          .replace("WEIGHT", "")
          .replace("/KG", "")
          .replace(/[()]/g, "")
          .trim()
      ) ?? [""];

    const data = lines.map(line => {
      const cells = Array.from(line.querySelectorAll("td")).map(td =>
        td.innerText.toUpperCase()
      );

      const value = {};

      headers.forEach(header => {
        let headerName;
        if (header.match(/SIZE/)) {
          headerName = "surfaceM2";
        } else if (header.match(/LUFF/)) {
          headerName = "luffLengthCm";
        } else if (header.match(/BOOM/)) {
          headerName = "boomLengthsCm";
        } else if (header.match(/BASE/)) {
          headerName = "mastExtensionLengthsCm";
        } else if (header.match(/WEIGHT/)) {
          // Might contain 2 values, one for standard and one for HD: "WEIGHT/KG / WEIGHT/KG (HD)"
          headerName = "weightKg";
        } else if (header.match(/BATTENS/)) {
          headerName = "battenCount";
        } else if (header.match(/CAMS/)) {
          headerName = "camCount";
        } else if (header.match(/RDM/)) {
          headerName = "masTypes";
        } else if (header.match(/MAST/)) {
          headerName = "mastLengthsCm";
        } else if (header.match(/TOP/)) {
          headerName = "topType";
        }
        // Some values need to be concatenated from different columns.
        // Example: "IDEAL MAST" & "ALTERNATE MAST"
        return (value[headerName] = value[headerName]
          ? value[headerName] + "/" + cells.shift()
          : cells.shift());
      });

      return value;
    });

    return {
      data,
      pictures,
      variants,
      description,
      dimensions,
      weightVariants
    };
  }

  async parse(url: string, modelName: string): Promise<Parsed<VariantType>> {
    const extracted: Extract = await this.crawler.crawl(url, this.extract);

    let pictures: Picture<VariantType>[] = [];
    let variants: WindsurfSail<VariantType>[] = [];

    const variantMatches = extracted.variants.map(variantInfo => {
      const { name, ...variant } = variantInfo;
      return {
        variant,
        regex: new RegExp(`/[^/]*-${name}\.[^.]*$`)
      };
    });

    const dimensions: (keyof VariantType)[] = ["size"];
    if (variantMatches.find(v => v.variant.construction?.length > 0)) {
      dimensions.push("construction");
    }
    if (variantMatches.find(v => v.variant.color?.length > 0)) {
      dimensions.push("color");
    }

    pictures = extracted.pictures.map(currentUrl => {
      const trimmedUrl = currentUrl.replace(/\?[^?]*$/, "");

      const picture: Picture<VariantType> = {
        url: currentUrl,
        variant: {}
      };

      const foundMatch = variantMatches.find(variantMatch =>
        trimmedUrl.match(variantMatch.regex)
      );
      if (foundMatch) {
        // If some variant for this picture, associate it.
        picture.variant = foundMatch.variant;
      }
      return picture;
    });

    variants = extracted.data.reduce(
      (
        accumulator: WindsurfSail<VariantType>[],
        variantData: { [key: string]: string }
      ) => {
        const surfaceM2 = stringToNumber(variantData["surfaceM2"]);
        const weights = split(variantData["weightKg"] ?? "");
        for (let i = 0; i < weights.length; i++) {
          const construction =
            extracted.weightVariants[i] === ""
              ? undefined
              : extracted.weightVariants[i];

          accumulator.push({
            surfaceM2,
            luffLengthCm: stringToNumber(variantData["luffLengthCm"]),
            boomLengthsCm: stringToNumberArray(variantData["boomLengthsCm"]),
            mastExtensionLengthsCm: stringToNumberArray(
              variantData["mastExtensionLengthsCm"]
            ),
            weightKg: stringToNumber(weights[i]),
            battenCount: stringToNumber(variantData["battenCount"]),
            camCount: stringToNumber(variantData["camCount"]),
            masTypes: split(variantData["masTypes"] ?? "")
              .filter(n => n !== "")
              .map(getMastType),
            mastLengthsCm: filteredStringToNumberArray(
              variantData["mastLengthsCm"],
              /,/
            ),
            topType: getTopType(variantData["topType"]),
            variant: {
              size: surfaceM2,
              construction
            }
          });
        }

        return accumulator;
      },
      []
    );

    return {
      dimensions,
      variants,
      pictures,
      description: { en: extracted.description }
    };
  }

  async getBrandInfo(): Promise<Brand> {
    const homePageUrl = "https://www.neilpryde.com/";

    const infoUrl = "https://www.neilpryde.com/pages/about-neilpryde";

    const extract1 = await this.crawler.crawl(infoUrl, () => {
      // Can't use "utils" imports in this "browser" function
      const unique = (value, index, self) =>
        value !== undefined && self.indexOf(value) === index;

      const logo = (document.querySelector(
        ".Header__LogoImage"
      ) as HTMLImageElement).src;

      const motto = (document.querySelector(
        ".shogun-heading-component"
      ) as HTMLDivElement).innerText;

      const links = Array.from(
        document.querySelectorAll(
          "[aria-label=Facebook], [aria-label=Twitter], [aria-label=Instagram], [aria-label=YouTube]"
        )
      )
        .map((a: HTMLAnchorElement) => a.href)
        .filter(unique);

      const pictures = [
        ...Array.from(document.querySelectorAll(".shogun-image")).map(
          (img: HTMLImageElement) => img.src
        ),
        ...Array.from(
          document.querySelectorAll("div[data-bgset]")
        ).map((div: HTMLDivElement) => div.getAttribute("data-bgset"))
      ];

      const description = Array.from(
        document.querySelectorAll<HTMLDivElement>("div.shg-theme-text-content")
      )
        .map(div => div.innerText)
        .join("\n\n");

      return { logo, description, motto, pictures, links };
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
      homePageUrl
    };
  }

  async parseCatalog(
    catalog: { year: number; url: string },
    productInfo: ProductInfo
  ) {
    const extractedLinks: { name: string; url: string }[] = (
      await this.crawler.crawl(catalog.url, () => {
        const links = Array.from(
          document.querySelectorAll<HTMLLinkElement>(".ProductItem__Title a")
        );

        return links.map(l => ({ name: l.innerText, url: l.href }));
      })
    ).map(({ name, url }) => ({
      name: name.replace(catalog.year.toString(), "").trim(),
      url
    }));

    const filteredLinks = extractedLinks.filter(link => {
      if (!productInfo[link.name.toUpperCase()]) {
        console.error(`Unknown product ${link.name}: ${link.url}`);
        return false;
      }
      return true;
    });

    await Promise.all(
      filteredLinks.map(link => {
        const productInfoElement = productInfo[link.name.toUpperCase()];
        return this.createModelFileFromUrl(
          link.url,
          productInfoElement.name,
          catalog.year,
          ProductType.propulsion,
          PropulsionType.windsurfSail,
          productInfoElement.programs
        );
      })
    );
  }

  static toProductInfo(productInfo: {
    [name: string]: Program[];
  }): ProductInfo {
    return Object.keys(productInfo).reduce(
      (accumulator: ProductInfo, current: string) => {
        accumulator[current.toUpperCase()] = {
          name: current,
          programs: productInfo[current]
        };
        return accumulator;
      },
      {}
    );
  }

  async parseCatalogs(
    catalogs: { year: number; url: string }[],
    productInfo: ProductInfo
  ) {
    return Promise.all(catalogs.map(c => this.parseCatalog(c, productInfo)));
  }

  async createModelFileFromUrl(
    url: string,
    modelName: string,
    year: number,
    type: ProductType,
    subType: ProductSubType,
    programs: Program[]
  ) {
    await this.writeProductFile(
      { brandName: this.brandName, name: modelName, year, type, subType },
      this.getProductDescription(url, modelName, year, type, subType, programs)
    );
  }

  getProductDescription(
    url: string,
    modelName: string,
    year: number,
    type: ProductType,
    subType: ProductSubType,
    programs: Program[]
  ) {
    return async () => {
      try {
        const {
          dimensions,
          variants,
          description,
          pictures
        } = await this.parse(url, modelName);
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
  const brandCrawler = new Neilpryde();

  /*
      await brandCrawler.writeBrandFile(
          brandCrawler.getBrandInfo.bind(brandCrawler)
      );
      */

  await brandCrawler.parseCatalogs(
    [
      { url: "https://www.neilpryde.com/collections/2019-sails", year: 2019 },
      { url: "https://www.neilpryde.com/collections/sails-2020", year: 2020 },
      { url: "https://www.neilpryde.com/collections/sails-2021", year: 2021 },
      { url: "https://www.neilpryde.com/collections/sails-2022", year: 2022 }
    ],
    Neilpryde.toProductInfo({
      Atlas: [Program.wave],
      Combat: [Program.wave],
      Dragonfly: [Program.beginner],
      "Flight EVO": [Program.race, Program.foiling],
      "Flight EVOII": [Program.race, Program.foiling],
      "Flight EVOIII": [Program.race, Program.foiling],
      Fly: [Program.wave],
      "Free flight": [Program.freeride, Program.foiling],
      Fusion: [Program.wave, Program.freeride],
      "RS:racing EVOXI": [Program.race],
      "RS:racing EVOXII": [Program.race],
      "RS:racing EVOXIII": [Program.race],
      Ryde: [Program.beginner, Program.freeride],
      Speedster: [Program.slalom, Program.foiling],
      V8: [Program.freeride],
      "V8 flight": [Program.freeride, Program.foiling],
      Wizard: [Program.freestyle, Program.wave],
      "Wizard pro": [Program.freestyle, Program.wave],
      "X:Move": [Program.wave, Program.freeride],
      "X:Wave": [Program.wave],
      Zone: [Program.wave],
      "Zone pro": [Program.wave]
    })
  );
})();
