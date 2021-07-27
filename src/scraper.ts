import {Activity, GearModel, GearVariant, GearType, Program, Picture} from "./model";
import path from "path";
import fs from "fs";

export interface Parsed<T> {
  dimensions: (keyof T)[],
  variants: GearVariant<T>[],
  description: { [language: string]: string }
  pictures: Picture<T>[];
}

const sanitize = (value: string) => value.replace(/ +/, '_')

export abstract class Scraper<T> {
  constructor(public brandName: string) {
  }

  abstract parse(url: string, modelName: string): Promise<Parsed<T>>;

  async createFile(url: string, modelName: string, years: number[], activities: Activity[], programs: Program[]) {
    const {dimensions, variants, description, pictures} = await this.parse(url, modelName);

    const model: GearModel<T> = {
      dimensions,
      brandName: this.brandName,
      years,
      name: modelName,
      type: GearType.sail,
      infoUrl: url,
      activities,
      programs,
      variants: variants,
      description,
      pictures
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
