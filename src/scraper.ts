import {
  Activity,
  GearModel,
  GearSpecificVariant,
  GearType,
  GearVariant,
  Picture,
  Program
} from "./model";
import path from "path";
import fs from "fs";

export interface Parsed<T> {
  dimensions: (keyof T)[];
  variants: GearSpecificVariant<T>[];
  description: { [languageScraper: string]: string };
  pictures: Picture<T>[];
}

const sanitize = (value: string) => value.replace(/ +/, "_");

export class FileUpdater<T = any> {
  async createFileFromJson(model: {
    brandName: string;
    name: string;
    years: number[];
  }) {
    const fileName = `${sanitize(model.brandName)}_${sanitize(
      model.name
    )}_${model.years.join("-")}.json`;
    const fullPath = path.join(path.dirname(__dirname), "products", fileName);

    console.log(JSON.stringify(model, null, 2));

    await fs.writeFile(fullPath, JSON.stringify(model, null, 2), () => {
      console.log(`File written: ${fullPath}`);
    });
  }
}

export abstract class Scraper<T> extends FileUpdater<T> {
  protected constructor(public brandName: string) {
    super();
  }

  abstract parse(url: string, modelName: string): Promise<Parsed<T>>;

  async createFileFromUrl(
    url: string,
    modelName: string,
    years: number[],
    activities: Activity[],
    type: GearType,
    programs: Program[]
  ) {
    const { dimensions, variants, description, pictures } = await this.parse(
      url,
      modelName
    );

    await this.createFile(
      dimensions,
      years,
      modelName,
      type,
      url,
      activities,
      programs,
      variants,
      description,
      pictures
    );
  }

  async createFile(
    dimensions: (keyof T)[],
    years: number[],
    modelName: string,
    type: GearType,
    url: string,
    activities: Activity[],
    programs: Program[],
    variants: GearSpecificVariant<T>[],
    description: { [p: string]: string },
    pictures: Picture<T>[]
  ) {
    const model: GearModel<T> = {
      dimensions,
      brandName: this.brandName,
      years,
      name: modelName,
      type,
      infoUrl: url,
      activities,
      programs,
      variants,
      description,
      pictures
    };

    await this.createFileFromJson(model);
  }
}
