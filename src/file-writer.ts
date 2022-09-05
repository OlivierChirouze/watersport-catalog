import {Brand, GearSpecificVariant, Picture, Product} from "./model";
import path from "path";
import fs from "fs";
import {ObjectMerger} from "./merge/object-merger";
import {ProductMerger} from "./merge/product-merger";

export interface Parsed<T> {
  dimensions: (keyof T)[];
  variants: GearSpecificVariant<T>[];
  description: { [languageScraper: string]: string };
  pictures: Picture<T>[];
}

export const fileExists = async path => {
  // the result can be either false (from the caught error) or it can be an fs.stats object
  const result = await fs.promises.stat(path).catch(err => {
    if (err.code === "ENOENT") {
      return false;
    }
    throw err;
  });

  return result !== false;
};

export enum WritePolicy {
  ignoreExisting,
  overwrite,
  merge
}

export class ObjectToWrite<T> {
  public writePolicy: WritePolicy;
  protected merger: ObjectMerger<T>;

  constructor(public fullPath: string, protected getData: () => Promise<T>) {
    if (process.argv[2] === "force" || process.argv[3] === "force") {
      this.writePolicy = WritePolicy.overwrite;
      console.log("called with -- force option: will Overwrite files");
    } else {
      this.writePolicy = WritePolicy.ignoreExisting;
    }

    this.merger = new ObjectMerger();
  }

  async needToWriteFile(): Promise<boolean> {
    if (this.writePolicy === WritePolicy.ignoreExisting) {
      if (await fileExists(this.fullPath)) {
        console.debug(`File already exists: ${this.fullPath}`);
        return false;
      }
    }
    return true;
  }

  async writeFile(): Promise<boolean> {
    if (!(await this.needToWriteFile())) {
      return false;
    }

    const dir = path.dirname(this.fullPath);
    if (!(await fileExists(dir))) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    try {
      let data = await this.getData();
      if (data === undefined) {
        // There was an error during parsing, don't write file
        return false;
      }

      let action = "Writing"

      if (this.writePolicy === WritePolicy.merge && await fileExists(this.fullPath)) {
        const existingContent = JSON.parse((await fs.promises.readFile(this.fullPath)).toString());
        data = this.merger.merge(existingContent, data);
        action = 'Merging'
      }

      console.log(`${action} ${this.fullPath}`);
      await fs.promises.writeFile(this.fullPath, JSON.stringify(data, null, 2));
      return true;

    } catch (e) {
      console.error(`Error writing ${this.fullPath}`);
      console.error(e);
      return false;
    }
  }
}

export class ProductToWrite<T> extends ObjectToWrite<Product<T>> {
  constructor(fullPath: string, getData: () => Promise<Product<T>>) {
    super(fullPath, getData);
    // Specific merger to handle "variants" specifics
    this.merger = new ProductMerger();
  }
}

export class FileWriter<T> {
  static sanitize(value: string) {
    return value.replace(/[ :\/]+/g, "_");
  }

  constructor(
      public brandName: string,
      protected brandsDir = path.join(path.dirname(__dirname), "data", "brands"),
      protected productsDir = path.join(
      path.dirname(__dirname),
      "data",
      "products",
      FileWriter.sanitize(brandName)
    )
  ) {}

  async writeProductFile(
    modelName: string,
    modelYear: number,
    getProductDescription: () => Promise<Product<T>>
  ) {
    const product = new ProductToWrite(
        path.join(
            this.productsDir,
            `${FileWriter.sanitize(this.brandName)}_${FileWriter.sanitize(
                modelName
            )}_${modelYear}.json`
        ),
        getProductDescription
    );

    await product.writeFile();
  }

  async writeBrandFile(getBrand: () => Promise<Brand>): Promise<void> {
    const product = new ObjectToWrite(
      path.join(this.brandsDir, `${FileWriter.sanitize(this.brandName)}.json`),
      getBrand
    );
    await product.writeFile();
  }
}
