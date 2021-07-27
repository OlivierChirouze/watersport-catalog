import {Crawler} from "../crawler";
import {Activity, Program, WindsurfSail, WindsurfSailTopType} from "../model";
import {extract, Parsed, Scraper, stringToNumber} from "../scraper";

interface Picture {
  title: string;
  src: string;
}

interface Spec {
  title: string;
  specs: { [key: string]: string };
}

const stringToNumberArray = (val: string): number[] => {
  if (val === undefined)
    return undefined

  return val.split(/[-\/]+/).map(i => stringToNumber(i))
}

const getTopType = (val: string) => {
  switch (val) {
    case 'Vario':
      return WindsurfSailTopType.vario;
    case 'Fixed':
      return WindsurfSailTopType.fixed;
  }

  throw `Unrecognized top type: ${val}`
};

type Extract = { pictures: Picture[], specs: Spec[], description: string }

class GaastraRecent extends Scraper {
  constructor(protected crawler: Crawler) {
    super("Gaastra");
  }

  extract(): Extract {
    // Note: need to keep all code inside this method to work in the browser
    const getVariationTitle = (variation: Element) => variation.querySelector('.fusion-title > h2') as HTMLHeadingElement;

    // Not empty variations
    const variations = Array.from(document.querySelectorAll('.techspecs_data'))
      .filter(getVariationTitle);

    const specs = variations.map(variation => {
      const title = getVariationTitle(variation).innerText;
      const specs = Array.from(variation.querySelectorAll('.fusion-text > p')).reduce(
        (accumulator: { [key: string]: string }, char: HTMLParagraphElement) => {
          const split = (char).innerText.split('\n');
          accumulator[split[0].toUpperCase()] = split[1];
          return accumulator;
        },
        {}
      );

      return {
        title,
        specs
      };
    })

    const getBoxTitle = (box: Element) => box.querySelector("h1") as HTMLHeadingElement;
    const imageBoxes = Array.from(document.querySelector("#product").querySelectorAll(".productimage_box"))
      .filter(getBoxTitle);

    const pictures = imageBoxes.map(box => ({
      title: getBoxTitle(box).innerText,
      src: (box.querySelector("img") as HTMLImageElement).src
    }));

    const description = (document.querySelector(".prod_text") as HTMLDivElement).innerText;

    return {specs, pictures, description};
  };

  async parse(url: string, modelName: string): Promise<Parsed> {

    const extracted = await this.crawler.crawl(url, this.extract);

    console.debug(JSON.stringify(extracted, null, 2))

    // Will extract info from "Color: C1" or "Vapor Air SL" or "Size 4.7"
    const getValueFromTitle = (title: string, key: string) => {
      return extract(title, new RegExp(`[\\s\\S]*${key}:? *(.*)(\n[\\s\\S]*|$)`))
    }

    // Unique list of colors, size with their picture
    const pictures = extracted.pictures.reduce(
      (accumulator: { [color: string]: { [subName: string]: { [size: string]: string } } }, current: Picture) => {
        // Color: C1\n\nSize 4.7
        // Vapor Air SL\nColor: C1

        const color = getValueFromTitle(current.title, 'Color');
        // If no size, use "*"
        const size = getValueFromTitle(current.title, 'Size') ?? '*';
        const subName = getValueFromTitle(current.title, modelName) ?? '*';

        accumulator[color] = accumulator[color] ?? {};
        accumulator[color][subName] = accumulator[color][subName] ?? {};
        accumulator[color][subName][size] = current.src;

        return accumulator;
      },
      {}
    )

    // Create as many sub models as there are sizes x colors
    const subModels = extracted.specs.reduce(
      (accumulator: WindsurfSail[], current: Spec) => {
        const size = current.title.replace(/[\s\S]*Size:? ([\d.]*)[\s\S]*/, '$1')
        const subName = getValueFromTitle(current.title, modelName)

        accumulator.push({
          subNames: subName ? [subName, size] : [size],
          // Map each color and affect picture url if relevant
          colorPictureURLs: Object.keys(pictures).reduce(
            (accumulator: { [color: string]: string[] }, color) => {
              accumulator[color] = [pictures[color][subName] ? (pictures[color][subName][size] ?? pictures[color][subName]['*'])
                : (pictures[color]['*'][size] ?? pictures[color]['*']['*'])]
              return accumulator;
            },
            {}),
          surfaceM2: stringToNumber(size),
          // Mast
          // 340-370 or 400/370
          mastLengthsCm: stringToNumberArray(current.specs['MAST']),
          // IMCS
          // 14-17
          mastIMCS: stringToNumberArray(current.specs['IMCS']),
          mastExtensionLengthsCm: stringToNumberArray(current.specs['BASE']),
          luffLengthCm: stringToNumber(current.specs['LUFF']),
          boomLengthCm: stringToNumber(current.specs['BOOM']),
          battenCount: stringToNumber(current.specs['BATTEN']),
          weightKg: stringToNumber(current.specs['WEIGHT (KG)']),
          camCount: stringToNumber(current.specs['CAMS']),
          topType: getTopType(current.specs['TOP']),
        })

        return accumulator;
      },
      []
    )

    return {
      subModels,
      // TODO reload page to get it in german
      description: {en: extracted.description}
    }
  };
}

class GaastraOld extends GaastraRecent {
  extract(): Extract {
    // Note: need to keep all code inside this method to work in the browser

    const specs = Array.from(document.querySelectorAll('.tech_specs_table'))
      .map(variation => {
          const variationSpecs = Array.from(variation.querySelectorAll('tr')).reduce(
            (accumulator: { [key: string]: string }, currentTr: HTMLTableRowElement) => {
              const key = currentTr.querySelector('th').textContent.split(/:/)[0].toUpperCase();
              accumulator[key] = currentTr.querySelector('td').textContent
              return accumulator
            },
            {}
          );
          const title = document.querySelector(`[data-target=${variation.id}] > a `).getAttribute('data')
          return {
            title,
            specs: variationSpecs
          };
        }
      )

    const pictures = Array.from(document.querySelectorAll('.img-preview'))
      .map((picture: HTMLImageElement) => {
        const title = (document.querySelector(`[data-target=${picture.id}] > span`) as HTMLSpanElement).innerText;
        return ({
          title: `COLOR: ${title}`,
          src: picture.src
        });
      })

    const description = (document.querySelector("#description") as HTMLDivElement).innerText;

    return {
      pictures,
      specs,
      description
    }
  };
}

(async () => {
  const crawler = await new Crawler().init();
  const recent = new GaastraRecent(crawler);
  const old = new GaastraOld(crawler);

  // Note: at that time, there were 2 versions of the Hybrid sail
  await old.createFile("https://ga-windsurfing.com/sails/2017/freeride-17/hybrid-hd/", "Hybrid HD", [2017], [Activity.windsurf], [Program.freeride]);
  await old.createFile("https://ga-windsurfing.com/sails/2017/freeride-17/hybrid/", "Hybrid", [2017], [Activity.windsurf], [Program.freeride]);

  await recent.createFile("https://ga-windsurfing.com/sails/2019/wave-cross/manic-19/", "Manic", [2019], [Activity.windsurf], [Program.wave]);
  await recent.createFile("https://ga-windsurfing.com/sails/2019/freeride/hybrid-19/", "Hybrid", [2019], [Activity.windsurf], [Program.freeride]);
  await recent.createFile("https://ga-windsurfing.com/sails/2020/freeride/hybrid-20", "Hybrid", [2020], [Activity.windsurf], [Program.freeride]);

  await recent.createFile("https://ga-windsurfing.com/sails/2021/foil/vapor-air-21/", "Vapor Air", [2021], [Activity.windfoil], [Program.slalom]);

  await crawler.close();
})();

