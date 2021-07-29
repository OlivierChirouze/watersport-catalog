import { Crawler } from "../crawler";
import {
  Activity,
  GearType,
  Picture,
  Program,
  WindsurfSail,
  WindsurfSailTopType
} from "../model";
import { Parsed, Scraper} from "../scraper";
import {extract, stringToNumber} from "../utils";

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

const stringToNumberArray = (val: string): number[] => {
  if (val === undefined) return undefined;

  return val.split(/[-\/]+/).map(i => stringToNumber(i));
};

const getTopType = (val: string) => {
  switch (val) {
    case "Vario":
      return WindsurfSailTopType.vario;
    case "Fixed":
      return WindsurfSailTopType.fixed;
  }

  throw `Unrecognized top type: ${val}`;
};

type Extract = { pictures: Img[]; specs: Spec[]; description: string };

class GaastraRecent extends Scraper<VariantType> {
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

    console.debug(JSON.stringify(extracted, null, 2));

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
          boomLengthCm: stringToNumber(current.specs["BOOM"]),
          battenCount: stringToNumber(current.specs["BATTEN"]),
          weightKg: stringToNumber(current.specs["WEIGHT (KG)"]),
          camCount: stringToNumber(current.specs["CAMS"]),
          topType: getTopType(current.specs["TOP"])
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

    let dimensions: (keyof VariantType)[] = [];

    if (Object.keys(images).length > 1) dimensions.push("color");

    if (uniqueConstructions.size > 1) dimensions.push("construction");

    if (uniqueSizes.size > 1) dimensions.push("size");

    //'size', 'construction', 'color'

    return {
      pictures,
      dimensions,
      variants,
      // TODO reload page to get it in german
      description: { en: extracted.description }
    };
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

    const description = (document.querySelector(
      "#description"
    ) as HTMLDivElement).innerText;

    return {
      pictures,
      specs,
      description
    };
  }
}

(async () => {
  const crawler = await new Crawler().init();
  const recent = new GaastraRecent(crawler);
  const old = new GaastraOld(crawler);

  await old.createFileFromUrl(
    "https://ga-windsurfing.com/sails/2017/freeride-17/hybrid/",
    "Hybrid",
    [2017],
    [Activity.windsurf, Activity.windfoil],
    GearType.sail,
    [Program.freeride]
  );

  await recent.createFileFromUrl(
    "https://ga-windsurfing.com/sails/2019/wave-cross/manic-19/",
    "Manic",
    [2019],
    [Activity.windsurf, Activity.windfoil],
    GearType.sail,
    [Program.wave]
  );
  await recent.createFileFromUrl(
    "https://ga-windsurfing.com/sails/2019/freeride/hybrid-19/",
    "Hybrid",
    [2019],
    [Activity.windsurf, Activity.windfoil],
    GearType.sail,
    [Program.freeride]
  );
  await recent.createFileFromUrl(
    "https://ga-windsurfing.com/sails/2020/freeride/hybrid-20",
    "Hybrid",
    [2020],
    [Activity.windsurf, Activity.windfoil],
    GearType.sail,
    [Program.freeride]
  );

  await recent.createFileFromUrl(
    "https://ga-windsurfing.com/sails/2021/foil/vapor-air-21/",
    "Vapor Air",
    [2021],
    [Activity.windfoil],
    GearType.sail,
    [Program.slalom]
  );

  await crawler.close();
})();
