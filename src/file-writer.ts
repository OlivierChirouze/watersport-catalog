import {Brand, GearSpecificVariant, Picture, Product} from "./model";
import path from "path";
import fs from "fs";

export interface Parsed<T> {
  dimensions: (keyof T)[];
  variants: GearSpecificVariant<T>[];
  description: { [languageScraper: string]: string };
  pictures: Picture<T>[];
}

const sanitize = (value: string) => value.replace(/ +/, "_");

export class FileWriter<T> {
  private forceRewrite: boolean = false;
  private dir: string;

  constructor(public brandName: string) {
    this.dir = path.join(
        path.dirname(__dirname),
        "data",
        "products",
        sanitize(this.brandName)
    );

    if (process.argv[2] === "force" || process.argv[3] === "force") {
      this.forceRewrite = true;
      console.log("called with -- force option: will Overwrite files");
    }
  }

  needToWriteFile(modelName: string,
                  modelYear: number): boolean {
    const fullPath = this.getFullPath(modelName, modelYear);
    if (!this.forceRewrite) {
      if (fs.existsSync(fullPath)) {
        console.log(`File already exists: ${fullPath}`);
        return false;
      }
    }
    return true;
  }

  async writeProductFile(
      modelName: string,
      modelYear: number,
      getProductDescription: () => Promise<Product<T>>
  ) {

    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, {recursive: true});
    }

    const fullPath = this.getFullPath(modelName, modelYear);

    // Note: do the check here (in addition to createModelFileFromUrl) for files created from manual data
    if (!this.needToWriteFile(modelName, modelYear)) {
      return;
    }

    console.log(`\t${this.brandName} ${modelName} ${modelYear}`);

    //console.debug(JSON.stringify(model, null, 2));

    try {
      const productDescription = await getProductDescription();
      if (productDescription === undefined) {
        // There was an error during parsing, don't write file
        return;
      }
      await fs.writeFile(
          fullPath,
          JSON.stringify(productDescription, null, 2),
          () => {
            //console.debug(`File written: ${fullPath}`);
          }
      );
    } catch (e) {
      console.error(`Error writing file ${fullPath}`);
      console.error(e);
    }
  }

  private getFullPath(modelName: string, modelYear: number) {
    return path.join(
        this.dir,
        this.getFileName(modelName, modelYear)
    );
  }

  public getFileName(modelName: string, modelYear: number) {
    return `${sanitize(this.brandName)}_${sanitize(modelName)}_${modelYear}.json`;
  }

  async writeBrandFile(getBrand: () => Promise<Brand>): Promise<void> {
    const fullPath = path.join(
        path.dirname(__dirname),
        "data",
        "brands",
        `${sanitize(this.brandName)}.json`
    );

    if (!this.forceRewrite) {
      if (fs.existsSync(fullPath)) {
        console.log(`File already exists: ${fullPath}`);
        return;
      }
    }

    try {
      await fs.writeFile(
          fullPath,
          JSON.stringify(await getBrand(), null, 2),
          () => {
            //console.debug(`File written: ${fullPath}`);
          }
      );
    } catch (e) {
      console.error(`Error writing file ${fullPath}`);
      console.error(e);
    }
  }
}
