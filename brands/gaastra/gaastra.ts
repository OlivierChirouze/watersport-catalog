import {Crawler} from "../../crawler";
import {Activity, GearModel, GearSubModel, GearType, Program, WindsurfSail, WindsurfSailTopType} from "../../model";
import * as fs from "fs";
import * as path from "path";

const brandName = "Gaastra";

interface Picture {
  title: string;
  src: string;
}

interface Spec {
  title: string;
  specs: { [key: string]: string };
}

const stringToNumber = (val: string): number => {
  if (val === undefined)
    return undefined

  const num = Number(val.replace(',', '.'));
  if (num === null)
    throw `Invalid number: ${val}`

  return num;
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

abstract class Gaastra {
  abstract parse(url: string): Promise<GearSubModel[]>;

  async createFile(url: string, modelName: string, year: number, activities: Activity[], programs: Program[]) {
    const subModels = await this.parse(url);

    const model: GearModel = {
      brandName,
      year,
      names: [brandName, modelName, '' + year],
      type: GearType.sail,
      infoUrl: url,
      activities,
      programs,
      subModels
    }

    const fileName = `${modelName.replace(/ +/, '_')}_${year}.json`
    const fullPath = path.join(__dirname, 'products', fileName);

    await fs.writeFile(fullPath, JSON.stringify(model, null, 2), () => {
      console.log(`File written: ${fullPath}`)
    });
  }
}

class GaastraRecent extends Gaastra {
  constructor(protected crawler: Crawler) {
    super();
  }

  extract(): { pictures: Picture[], specs: Spec[] } {
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

    return {specs, pictures};
  };

  async parse(url: string): Promise<GearSubModel[]> {

    const parsed = await this.crawler.crawl(url, this.extract);

    console.debug(JSON.stringify(parsed, null, 2))

    // Unique list of colors, size with their picture
    const pictures = parsed.pictures.reduce(
      (accumulator: { [color: string]: { [size: string]: string } }, current: Picture) => {
        // Color: C1\n\nSize 4.7
        const colorAndSize = current.title.split(/\n+/).map(text => text.split(/:? /)[1]);
        const color = colorAndSize[0];

        // If no size, use "*"
        const size = colorAndSize[1] ?? '*';
        accumulator[color] = accumulator[color] ?? {};
        accumulator[color][size] = current.src;

        return accumulator;
      },
      {}
    )

    // Create as many sub models as there are sizes x colors
    return parsed.specs.reduce(
      (accumulator: WindsurfSail[], current: Spec) => {
        const size = current.title.split(/:? /)[1];

        Object.keys(pictures).forEach(color => {
          accumulator.push({
            subNames: [size, color],
            pictureUrl: pictures[color][size] || pictures[color]['*'],
            surfaceDm2: stringToNumber(size) * 10,
            // Mast
            // 340-370 or 400/370
            possibleMastLengthsCm: current.specs['MAST'].split(/[-\/]+/).map(i => stringToNumber(i)),
            // IMCS
            // 14-17
            possibleMastIMCS: current.specs['IMCS'].split(/[-\/]+/).map(i => stringToNumber(i)),
            luffLengthCm: stringToNumber(current.specs['LUFF']),
            boomLengthCm: stringToNumber(current.specs['BOOM']),
            battenCount: stringToNumber(current.specs['BATTEN']),
            weightKg: stringToNumber(current.specs['WEIGHT (KG)']),
            camCount: stringToNumber(current.specs['CAMS']),
            topType: getTopType(current.specs['TOP']),
            // TODO what is "base"?
          })
        });

        return accumulator;
      },
      []
    )
  };
}

class GaastraOld extends GaastraRecent {
  extract(): { pictures: Picture[], specs: Spec[] } {
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

    return {
      pictures,
      specs
    }
  };
}

(async () => {
  const crawler = await new Crawler().init();
  const recent = new GaastraRecent(crawler);
  const old = new GaastraOld(crawler);

  await recent.createFile("https://ga-windsurfing.com/sails/2019/wave-cross/manic-19/", "Manic", 2019, [Activity.windsurf], [Program.wave]);
  await recent.createFile("https://ga-windsurfing.com/sails/2019/freeride/hybrid-19/", "Hybrid", 2019, [Activity.windsurf], [Program.freeride]);
  await recent.createFile("https://ga-windsurfing.com/sails/2020/freeride/hybrid-20", "Hybrid", 2020, [Activity.windsurf], [Program.freeride]);

  // Note: at that time, there were 2 versions of the Hybrid
  await old.createFile("https://ga-windsurfing.com/sails/2017/freeride-17/hybrid-hd/", "Hybrid HD", 2017, [Activity.windsurf], [Program.freeride]);

  await crawler.close();
})();

