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

    const fileName = `${modelName}_${year}.json`
    const fullPath = path.join(__dirname, 'products', fileName);

    await fs.writeFile(fullPath, JSON.stringify(model, null, 2), () => {
      console.log(`File written: ${fullPath}`)
    });
  }
}

class GaastraRecent extends Gaastra {
  constructor(private crawler: Crawler) {
    super();
  }

  static extract(): { pictures: Picture[], specs: Spec[] } {
    const getVariationTitle = (variation: Element) => variation.querySelector('.fusion-title > h2') as HTMLHeadingElement;

    // Not empty variations
    const variations = Array.from(document.querySelectorAll('.techspecs_data'))
      .filter(getVariationTitle);

    const specs = variations.map(variation => {
      const title = getVariationTitle(variation).innerText;
      const specs = Array.from(variation.querySelectorAll('.fusion-text > p')).reduce(
        (accumulator: { [key: string]: string }, char: HTMLParagraphElement) => {
          const split = (char).innerText.split('\n');
          accumulator[split[0]] = split[1];
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

    // TODO use pictures to determine available colors

    return {specs, pictures};
  };

  async parse(url: string): Promise<GearSubModel[]> {

    const parsed = await this.crawler.crawl(url, GaastraRecent.extract);

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
            surfaceDm2: Number(size) * 10,
            // Mast
            // 340-370 or 400/370
            possibleMastLengthsCm: current.specs['Mast'].split(/[-\/]+/).map(i => Number(i)),
            // IMCS
            // 14-17
            possibleMastIMCS: current.specs['IMCS'].split(/[-\/]+/).map(i => Number(i)),
            luffLengthCm: Number(current.specs['Luff']),
            boomLengthCm: Number(current.specs['Boom']),
            battenCount: Number(current.specs['Batten']),
            topType: getTopType(current.specs['Top']),
            // TODO what is "base"?
          })
        });

        return accumulator;
      },
      []
    )
  };
}

// TODO GaastraOld

(async () => {
  const crawler = await new Crawler().init();
  const recent = new GaastraRecent(crawler);

  await recent.createFile("https://ga-windsurfing.com/sails/2019/wave-cross/manic-19/", "Manic", 2019, [Activity.windsurf], [Program.wave]);
  await recent.createFile("https://ga-windsurfing.com/sails/2019/freeride/hybrid-19/", "Hybrid", 2019, [Activity.windsurf], [Program.freeride]);
  await recent.createFile("https://ga-windsurfing.com/sails/2020/freeride/hybrid-20", "Hybrid", 2020, [Activity.windsurf], [Program.freeride]);

  await crawler.close();
})();

