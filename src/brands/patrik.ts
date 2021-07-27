import {Crawler} from "../crawler";
import {Activity, FinConfig, GearSubModel, Program, WindsurfBoard, WindsurfFinBoxType} from "../model";
import {extract, Parsed, Scraper, stringToNumber} from "../scraper";

type Extract = {
  data: { [name: string]: { [key: string]: string } },
  pictures: { [name: string]: string },
  description?: string
}

const getFinBoxType = (value: string) => {
  switch (value) {
    case "US 8″":
      return WindsurfFinBoxType.US8
    case "US 5″":
      return WindsurfFinBoxType.US5
    case "Deep tuttle":
      return WindsurfFinBoxType.DeepTuttleBox
    case "Slot":
      return WindsurfFinBoxType.SlotBox
  }

  throw  `Fin type not recognized: ${value}`
}

class Patrik extends Scraper {
  constructor(protected crawler: Crawler) {
    super("Patrik")
  }

  async parse(url: string, modelName: string): Promise<Parsed> {
    const extracted = await this.crawler.crawl(url, this.extract);

    // Pictures per variation and size
    const pictures = Object.keys(extracted.pictures).reduce(
      (accumulator: { [variation: string]: { [size: number]: string } }, title: string) => {
        // "qt-wave 68\nGBM" => 68, GBM
        // "qt-wave 73" => 73
        const size = stringToNumber(title.replace(new RegExp(`${modelName.toUpperCase()} *(.*)(\\n[\\s\\S]*|$)`), '$1')) ?? '*'
        const variation = extract(title, new RegExp(`.*\n(.*)`)) ?? '*'

        accumulator[variation] = accumulator[variation] ?? {};
        accumulator[variation][size] = extracted.pictures[title];

        return accumulator;
      },
      {}
    )

    console.log('Pictures')
    console.log(JSON.stringify(pictures, null, 2))

    const subModels = Object.keys(extracted.data).reduce(
      (accumulator: GearSubModel[], key: string) => {
        const size = extract(key, new RegExp(`${modelName.toUpperCase()} (.*)`))
        const data = extracted.data[key]

        Object.keys(pictures).forEach(variation => {

          const getSubValueOrDefault = variation === '*'
            ? (value: string) => value
            : (value: string) => extract(value, new RegExp(`[\\s\\S]*${variation}: (.*)(\n[\\s\\S]*|$)`)) ?? value

          const fins = getSubValueOrDefault(data["FIN BOX"]).split(/[\n+]+/)
            .reduce((accumulator: FinConfig[], value: string) => {
                // 3xUS 8″
                // Deep tuttle
                const count = stringToNumber(extract(value, /(\d*)x.*/) ?? '1')
                const type = getFinBoxType(extract(value, /\d*x(.*)/) ?? value)

                accumulator.push({count, type})

                return accumulator
              },
              [])

          const [fromM2, toM2] = getSubValueOrDefault(data['SAIL\nRANGE\n[M2]'])
            .split('-')
            .map(value => stringToNumber(value))

          const gearModel: WindsurfBoard = {
            subNames: [variation, size],
            colorPictureURLs: {['default']: pictures[variation][size]},
            lengthCm: stringToNumber(getSubValueOrDefault(data['LENGTH\n[MM]'])) / 10,
            widthCm: stringToNumber(getSubValueOrDefault(data['WIDTH\n[MM]'])) / 10,
            volumeL: stringToNumber(getSubValueOrDefault(data['VOLUME\n[LITRE]'])),
            // TODO verify if same name on other pages
            weightKg: stringToNumber(getSubValueOrDefault(data['WEIGHT\n(+/-6%)\n[KG]'])),
            // "5×4"
            strapInsertCount: stringToNumber(getSubValueOrDefault(data["STRAP\nOPTIONS &\nINSERT HOLES"]).split('×')[0]),
            fins,
            sailRange: {fromM2, toM2}
          }

          accumulator.push(gearModel)
        })


        return accumulator;
      },
      []
    )

    return {subModels, description: extracted.description ? {en: extracted.description} : {}};
  }

  extract(): Extract {
    // Note: need to keep all code inside this method to work in the browser

    const imageDivs = Array.from(document.querySelectorAll('div.avia-image-container'))

    const pictures: { [name: string]: string } = {};

    imageDivs.forEach((div: HTMLDivElement) => {
      let legendSection = div.parentElement.querySelector('section');
      if (!legendSection)
        // This is not a picture for the gear, but a random photo
        return;

      const title = legendSection.innerText.toUpperCase();
      pictures[title] = div.querySelector('a').href;
    })


    const tables = Array.from(document.querySelectorAll('.avia-data-table'));

    const data: { [name: string]: { [key: string]: string } } = {};

    tables.forEach(table => {
      const headers = Array.from(table.querySelector('tr').querySelectorAll('td'))
        .map((header: HTMLTableDataCellElement) => header.innerText.toUpperCase());

      if (headers.includes('LENGTH\n[MM]') || headers.includes('BEST\nSAIL SIZE\n[M2]')) {
        // This is the dimensions or recommendations table

        const lines = Array.from(table.querySelectorAll('tr'));
        // First row is header row
        lines.shift();

        lines.forEach((line: HTMLTableRowElement) => {
          const name = line.querySelector('th').innerText;
          data[name] = data[name] ?? {};

          const cells = Array.from(line.querySelectorAll('td'))
            .map(td => td.innerText);

          headers.forEach(header => {
            data[name][header] = cells.shift();
          })
        })
      }
    })

    // Very basic: paragraphs that have some words!
    const paragraphs = Array.from(document.querySelectorAll('p'))
      .map(p => p.innerText)
      .filter(p => p.length > 100)

    const description = paragraphs.length > 0 ? paragraphs[0] : undefined

    return {data, pictures, description};
  };
}

(async () => {
  const crawler = await new Crawler().init();
  const brandCrawler = new Patrik(crawler);

  await brandCrawler.createFile("https://patrik-windsurf.com/qt-wave/", "qt-wave", [2019, 2020], [Activity.windsurf], [Program.wave]);
  await brandCrawler.createFile("https://patrik-windsurf.com/qt-wave-2/", "qt-wave", [2020], [Activity.windsurf], [Program.wave]);

  await crawler.close();
})();

