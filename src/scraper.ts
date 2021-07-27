import {Activity, GearModel, GearSubModel, GearType, Program} from "./model";
import path from "path";
import fs from "fs";

export type Parsed = { subModels: GearSubModel[], description: { [language: string]: string } };

const sanitize = (value: string) => value.replace(/ +/, '_')

export abstract class Scraper {
  constructor(public brandName: string) {
  }

  abstract parse(url: string, modelName: string): Promise<Parsed>;

  async createFile(url: string, modelName: string, years: number[], activities: Activity[], programs: Program[]) {
    const {subModels, description} = await this.parse(url, modelName);

    const model: GearModel = {
      brandName: this.brandName,
      years,
      name: modelName,
      type: GearType.sail,
      infoUrl: url,
      activities,
      programs,
      subModels,
      description
    }

    const fileName = `${sanitize(this.brandName)}_${sanitize(modelName)}_${years.join('-')}.json`
    const fullPath = path.join(path.dirname(__dirname), 'products', fileName);

    await fs.writeFile(fullPath, JSON.stringify(model, null, 2), () => {
      console.log(`File written: ${fullPath}`)
    });
  }
}

export const stringToNumber = (val: string): number => {
  if (val === undefined)
    return undefined

  const num = Number(val.replace(',', '.'));
  if (num === null)
    throw `Invalid number: ${val}`

  return num;
}

export const extract = (val: string, regex: RegExp) => {
  const extracted = val.replace(regex, '$1');
  if (extracted === val)
    return undefined

  return extracted
}
