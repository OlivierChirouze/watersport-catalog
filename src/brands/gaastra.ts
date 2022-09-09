import { Brand, guessLinkType } from "../model/brand";
import { Crawler } from "../crawler";
import {
  Picture,
  Product,
  ProductSubType,
  ProductType,
  Program,
  PropulsionType,
  WindsurfSail,
  WindsurfSailTopType
} from "../model";
import { FileWriter, Parsed } from "../file-writer";
import { extract, stringToNumber, stringToNumberArray } from "../utils";

interface Img {
  title: string;
  src: string;
}

interface Spec {
  title: string;
  specs: { [key: string]: string };
}

interface VariantType {
  size: number;
  construction: string;
  color: string;
}

const getTopType = (val: string) => {
  switch (val) {
    case "Vario":
      return WindsurfSailTopType.vario;
    case "Fixed":
      return WindsurfSailTopType.fixed;
  }

  throw `Unrecognized top type: ${val}`;
};

function getShortYear(year: number) {
  return year.toString().substr(2, 2);
}

type Extract = { pictures: Img[]; specs: Spec[]; description: string };

interface PartialCatalogProduct {
  picture: string;
  url: string;
  name: string;
}

interface CatalogProduct extends PartialCatalogProduct {
  programs: Program[];
}

class GaastraRecent extends FileWriter<VariantType> {
  constructor(protected crawler: Crawler) {
    super("Gaastra");
  }

  extract(): Extract {
    // Note: need to keep all code inside this method to work in the browser
    const getVariationTitle = (variation: Element) =>
      variation.querySelector(".fusion-title > h2") as HTMLHeadingElement;

    // Not empty variations
    const variations = Array.from(
      document.querySelectorAll(".techspecs_data")
    ).filter(getVariationTitle);

    const specs = variations.map(variation => {
      const title = getVariationTitle(variation).innerText.toUpperCase();
      const specs = Array.from(
        variation.querySelectorAll(".fusion-text > p")
      ).reduce(
        (
          accumulator: { [key: string]: string },
          char: HTMLParagraphElement
        ) => {
          const split = char.innerText.split("\n");
          accumulator[split[0].toUpperCase()] = split[1];
          return accumulator;
        },
        {}
      );

      return {
        title,
        specs
      };
    });

    const getBoxTitle = (box: Element) =>
      box.querySelector("h1") as HTMLHeadingElement;
    const imageBoxes = Array.from(
      document.querySelector("#product").querySelectorAll(".productimage_box")
    ).filter(getBoxTitle);

    const pictures = imageBoxes.map(box => ({
      title: getBoxTitle(box).innerText.toUpperCase(),
      src: (box.querySelector("img") as HTMLImageElement).src
    }));

    const description = (document.querySelector(".prod_text") as HTMLDivElement)
      .innerText;

    return { specs, pictures, description };
  }

  async parse(url: string, modelName: string): Promise<Parsed<VariantType>> {
    const extracted = await this.crawler.crawl(url, this.extract);

    //console.debug(JSON.stringify(extracted, null, 2));

    // Will extract info from "Color: C1" or "Vapor Air SL" or "Size 4.7"
    const getValueFromTitle = (title: string, key: string) => {
      return extract(
        title,
        new RegExp(`[\\s\\S]*${key}:? *(.*)(\n[\\s\\S]*|$)`)
      );
    };

    const uniqueConstructions = new Set<string>();
    const uniqueSizes = new Set<number>();

    // Unique list of colors, size with their picture
    const images = extracted.pictures.reduce(
      (
        accumulator: {
          [color: string]: { [subName: string]: { [size: string]: string } };
        },
        current: Img
      ) => {
        // Color: C1\n\nSize 4.7
        // Vapor Air SL\nColor: C1

        const color = getValueFromTitle(current.title, "COLOR");
        // If no size, use "*"
        const size = getValueFromTitle(current.title, "SIZE") ?? "*";
        const subName = getValueFromTitle(current.title, modelName) ?? "*";

        accumulator[color] = accumulator[color] ?? {};
        accumulator[color][subName] = accumulator[color][subName] ?? {};
        accumulator[color][subName][size] = current.src;

        return accumulator;
      },
      {}
    );

    // Create as many sub models as there are sizes x colors
    const variants = extracted.specs.reduce(
      (accumulator: WindsurfSail<VariantType>[], current: Spec) => {
        const size = stringToNumber(
          extract(current.title, /[\s\S]*SIZE:? ([\d.]*)[\s\S]*/)
        );
        const construction = getValueFromTitle(
          current.title,
          modelName.toUpperCase()
        );

        uniqueConstructions.add(construction);
        uniqueSizes.add(size);

        accumulator.push({
          variant: {
            size,
            construction
          },
          surfaceM2: size,
          // Mast
          // 340-370 or 400/370
          mastLengthsCm: stringToNumberArray(current.specs["MAST"]),
          // IMCS
          // 14-17
          mastIMCS: stringToNumberArray(current.specs["IMCS"]),
          mastExtensionLengthsCm: stringToNumberArray(current.specs["BASE"]),
          luffLengthCm: stringToNumber(current.specs["LUFF"]),
          boomLengthsCm: [stringToNumber(current.specs["BOOM"])],
          battenCount: stringToNumber(current.specs["BATTEN"]),
          weightKg: stringToNumber(current.specs["WEIGHT (KG)"]),
          camCount: stringToNumber(current.specs["CAMS"]),
          topType: getTopType(current.specs["TOP"] ?? current.specs["HEAD"])
        });

        return accumulator;
      },
      []
    );

    const pictures = Object.keys(images).reduce(
      (accumulator: Picture<VariantType>[], color) => {
        Object.keys(images[color]).forEach(construction => {
          Object.keys(images[color][construction]).forEach(size => {
            const url = images[color][construction][size];
            accumulator.push({
              variant: {
                color,
                construction: construction === "*" ? undefined : construction,
                size: size === "*" ? undefined : stringToNumber(size)
              },
              url
            });
          });
        });
        return accumulator;
      },
      []
    );

    //'size', 'construction', 'color'
    let dimensions: (keyof VariantType)[] = [];

    if (uniqueSizes.size > 1) dimensions.push("size");

    if (uniqueConstructions.size > 1) dimensions.push("construction");

    if (Object.keys(images).length > 1) dimensions.push("color");

    return {
      pictures,
      dimensions,
      variants,
      // TODO reload page to get it in german
      description: { en: extracted.description }
    };
  }

  async getBrandInfo(): Promise<Brand> {
    const homePageUrl = "https://ga-windsurfing.com";

    // TODO get in German
    const infoUrl = "https://ga-windsurfing.com/about-us/";

    const extract1 = await this.crawler.crawl(infoUrl, () => {
      // Can't use "utils" imports in this "browser" function
      const unique = (value, index, self) =>
        value !== undefined && self.indexOf(value) === index;

      const logo = document.querySelector<HTMLImageElement>("#logo img").src;

      const description = Array.from(
        document.querySelectorAll<HTMLParagraphElement>("#content p")
      )
        .map(p => p.innerText)
        .filter(n => n.length > 0)
        .join("\n\n");

      const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>(".social-icons a")
      )
        .map(a => a.href)
        .filter(unique);

      const pictures = Array.from(
        document.querySelectorAll<HTMLImageElement>(".image-cover img")
      ).map(a => a.src);

      return { logo, description, pictures, links };
    });

    const brand: Brand = {
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

    return brand;
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

  async getYearCatalog(year: number): Promise<CatalogProduct[]> {
    const extractCatalog = async (
      url: string
    ): Promise<PartialCatalogProduct[]> => {
      console.log(url);
      return await this.crawler.crawl(url, () => {
        return Array.from(document.querySelectorAll("li.product")).map(
          (li: HTMLUListElement) => {
            // This is a product
            const picture = li.querySelector("img").getAttribute("src");
            const url = li.querySelector("a").getAttribute("href");
            const name = li.querySelector("h3").innerText;

            return { picture, url, name };
          }
        );
      });
    };

    const catalog: CatalogProduct[] = [];

    const categories = ["wave-cross", "freeride", "slalom-race", "foil"];

    for (const gaastraCategory of categories) {
      let programProducts: PartialCatalogProduct[];
      try {
        programProducts = await extractCatalog(
          `https://ga-windsurfing.com/sails/${year}/${gaastraCategory}/`
        );
      } catch (e1) {
        // Try alternative
        console.log("try alternative URL");
        try {
          programProducts = await extractCatalog(
            `https://ga-windsurfing.com/sails/${year}/${gaastraCategory}-${getShortYear(
              year
            )}/`
          );
        } catch (e2) {
          console.log(`Ignore category ${gaastraCategory}`);
          continue;
        }
      }

      let programs;
      switch (gaastraCategory) {
        case "wave-cross":
          programs = [Program.wave];
          break;
        case "freeride":
          programs = [Program.freeride];
          break;
        case "slalom-race":
          programs = [Program.slalom];
          break;
        case "foil":
          programs = [Program.slalom, Program.freeride];
          break;
      }

      catalog.push(
        ...programProducts.map(
          (product): CatalogProduct => ({
            ...product,
            name: product.name.replace(` ’${getShortYear(year)}`, ""),
            programs,
            // Remove "size" constraint from image URL (ex: -600x857)
            picture: this.stripImageUrl(product.picture)
          })
        )
      );
    }

    return catalog;
  }

  async parseCatalog(year: number, catalog: CatalogProduct[]) {
    for (let catalogProduct of catalog) {
      await this.writeProductFile(
        {
          brandName: this.brandName,
          name: catalogProduct.name,
          year,
          type: ProductType.propulsion,
          subType: PropulsionType.windsurfSail
        },
        async (): Promise<Product<any>> => {
          try {
            const {
              dimensions,
              variants,
              description,
              pictures
            } = await this.parse(catalogProduct.url, catalogProduct.name);
            // Merge pictures from the category's page and from the product's page
            const mergedPictures = pictures.map(({ variant, url }) => ({
              variant,
              // Remove "size" constraint from image URL (ex: -600x857)
              url: this.stripImageUrl(url)
            }));
            if (!mergedPictures.find(p => p.url === catalogProduct.picture)) {
              mergedPictures.push({ variant: {}, url: catalogProduct.picture });
            }
            const product: Product<any> = {
              dimensions,
              brandName: this.brandName,
              year,
              name: catalogProduct.name,
              type: ProductType.propulsion, // FIXME: this might not always be true
              subType: PropulsionType.windsurfSail, // FIXME: this might not always be true
              infoUrl: catalogProduct.url,
              programs: catalogProduct.programs,
              variants,
              description,
              pictures: mergedPictures
            };
            return Promise.resolve(product);
          } catch (e1) {
            console.error(`Error parsing ${catalogProduct.url}:`);
            console.error(e1);
          }
        }
      );
    }
  }

  private stripImageUrl(url: string) {
    return url.replace(/-\d\d\d+x\d\d\d+/, "");
  }
}

class GaastraOld extends GaastraRecent {
  extract(): Extract {
    // Note: need to keep all code inside this method to work in the browser

    const specs = Array.from(
      document.querySelectorAll(".tech_specs_table")
    ).map(variation => {
      const variationSpecs = Array.from(
        variation.querySelectorAll("tr")
      ).reduce(
        (
          accumulator: { [key: string]: string },
          currentTr: HTMLTableRowElement
        ) => {
          const key = currentTr
            .querySelector("th")
            .textContent.split(/:/)[0]
            .toUpperCase();
          accumulator[key] = currentTr.querySelector("td").textContent;
          return accumulator;
        },
        {}
      );
      const title = document
        .querySelector(`[data-target=${variation.id}] > a `)
        .getAttribute("data");
      return {
        title,
        specs: variationSpecs
      };
    });

    const pictures = Array.from(document.querySelectorAll(".img-preview")).map(
      (picture: HTMLImageElement) => {
        const title = (document.querySelector(
          `[data-target=${picture.id}] > span`
        ) as HTMLSpanElement).innerText;
        return {
          title: `COLOR: ${title}`,
          src: picture.src
        };
      }
    );

    let description = (document.querySelector("#description") as HTMLDivElement)
      ?.innerText;

    if (description === undefined) {
      // Let's try something else
      description = Array.from(document.querySelectorAll("p, li:not([class])"))
        .map((p: HTMLParagraphElement | HTMLUListElement) => p.innerText)
        .filter(t => t.trim() !== "")
        .join("\n");
    }

    return {
      pictures,
      specs,
      description
    };
  }
}

(async () => {
  const crawler = await new Crawler();
  const brandCrawler = new GaastraRecent(crawler);
  const old = new GaastraOld(crawler);

  await brandCrawler.writeBrandFile(
    brandCrawler.getBrandInfo.bind(brandCrawler)
  );

  // TODO `https://ga-windsurfing.com/sails/${year}/${category}/`
  // Alternative: `https://ga-windsurfing.com/sails/${year}/${category}-${year}/`
  // Categories:
  // 'wave': 'wave-cross'
  // 'freeride': 'freeride'
  // 'slalom': 'slalom-race'
  // - get each model (remove " '17" from name)
  // - get each model photo
  // - For each, parse and assign program wave
  // Years: 2015 -> 2018

  // Years: 2019 - 2021
  // Same thing but:
  // - don't take picture from main page
  // - with new crawler
  // - add category 'foil': 'foil' /!\ in this case only activity will be windfoil

  for (const year of [2015, 2016, 2017, 2018]) {
    await old.parseCatalog(year, await old.getYearCatalog(year));
  }

  for (const year of [2019, 2020, 2021]) {
    await brandCrawler.parseCatalog(
      year,
      await brandCrawler.getYearCatalog(year)
    );
  }
})();
