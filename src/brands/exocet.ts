import {Crawler} from "../crawler";
import {Activity, FinConfig, GearVariant, Program, WindsurfBoard, WindsurfFinBoxType} from "../model";
import {extract, Parsed, Scraper, stringToNumber} from "../scraper";

type Extract = {
  data: { [name: string]: { [key: string]: string } },
  pictureUrl: string,
  description: string
}

const getFinBoxType = (value: string) => {
  switch (value.toUpperCase()) {
    case "DEEP TUTTLE BOX (FOIL COMPATIBLE)":
      return WindsurfFinBoxType.DeepTuttleBox
  }

  throw  `Fin type not recognized: ${value}`
}

interface VariantType {
  size: string;
}

class Exocet extends Scraper<VariantType> {
  constructor(protected crawler: Crawler) {
    super("Exocet")
  }

  extract(): Extract {
    // Note: need to keep all code inside this method to work in the browser

    const pictureUrl = (document.querySelector('img.imgmain') as HTMLImageElement).src

    const description = (document.querySelector('.c-app-product-tabs__panes > div[tab-index=tab0]') as HTMLDivElement).innerText

    const table = document.querySelector('div[tab-index=tab1] > table') as HTMLTableElement;

    const headers = Array.from(table.querySelector('tr').querySelectorAll('td'))
      .map((header: HTMLTableDataCellElement) => header.innerText.toUpperCase())
      .filter(td => td !== '');

    const lines = Array.from(table.querySelectorAll('tr'));
    // First row is header row
    lines.shift();

    const data = lines.reduce(
      (accumulator: { [name: string]: { [key: string]: string } }, line: HTMLTableRowElement) => {

        const cells = Array.from(line.querySelectorAll('td'))
          .map(td => td.innerText.toUpperCase());
        // First column is name
        const name = cells.shift()
        accumulator[name] = {};

        headers.forEach(header => accumulator[name][header] = cells.shift())

        return accumulator
      },
      {}
    )

    return {data, pictureUrl, description};
  };

  async parse(url: string, modelName: string): Promise<Parsed<VariantType>> {
    const extracted = await this.crawler.crawl(url, this.extract);

    console.log(extracted)

    const description = {en: extracted.description}

    const variants = Object.keys(extracted.data).reduce(
      (accumulator: WindsurfBoard<VariantType>[], name: string) => {
        const data = extracted.data[name];

        const [fromM2, toM2] = extract(data['SAILS RANGE'], /(.*) M2/)
          .split(' - ')
          .map(value => stringToNumber(value))

        const size = extract(name, new RegExp(`${modelName.toUpperCase()} (.*)`))
        const gearModel: WindsurfBoard<VariantType> = {
          variant: {size},
          lengthCm: stringToNumber(extract(data['LENGTH'], /(.*) CM/)),
          widthCm: stringToNumber(extract(data['WIDTH'], /(.*) CM/)),
          volumeL: stringToNumber(extract(data['VOLUME'], /(.*) LITRES/)),
          weightKg: stringToNumber(extract(data['WEIGHT'], /(.*) KG/)),
          fins: [{count: 1, type: getFinBoxType(data['BOX'])}],
          sailRange: {fromM2, toM2}
        }

        accumulator.push(gearModel)
        return accumulator;
      },
      []
    )

    return {
      dimensions: ['size'],
      variants,
      description,
      pictures: [{variant: {}, url: extracted.pictureUrl}]
    }
  }
}

(async () => {
  const crawler = await new Crawler().init();
  const brandCrawler = new Exocet(crawler);

  // TODO load french description from https://www.exocet-original.fr/freefoil-ast-c2x29552596
  // TODO support 2 urls for the "same" board: Freefoil AST and Freefoil Carbone
  await brandCrawler.createFile("https://www.exocet-original.com/freefoil-ast-c2x33091951", "Freefoil", [2019, 2020, 2021], [Activity.windfoil], [Program.freeride]);

  await crawler.close();
})();

