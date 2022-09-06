import fs from "fs";
import path from "path";
import {Brand, Product} from "./model";
import {FileWriter} from "./file-writer";

export class DataImporter {
    protected fileWriters: { [brandName: string]: FileWriter<unknown> } = {};

    constructor(
        protected importDir = path.join(__dirname, "..", "data-import")
    ) {
    }

    async loadImportProducts() {
        const productsDir = path.join(this.importDir, "products");
    const files = await fs.promises.readdir(productsDir);

    await Promise.all(
      files.map(async f => {
        const data = await fs.promises.readFile(path.join(productsDir, f));
        const product = JSON.parse(data.toString()) as Product<unknown>;

        // TODO do some validation on the file

        const brandName = product.brandName;
        // Create dummy brand file if needed
        await this.createBrandFile({
          name: brandName,
          links: [],
          pictures: []
        });

        console.log(`Loading ${f}`);
          return await this.getBrandFileWriter(brandName).writeProductFile(product, () => Promise.resolve(product));
      })
    );
  }

  async loadImportBrands() {
    const brandsDir = path.join(this.importDir, "brands");
    const files = await fs.promises.readdir(brandsDir);

    await Promise.all(
      files.map(async f => {
        const data = await fs.promises.readFile(path.join(brandsDir, f));
        const brand = JSON.parse(data.toString()) as Brand;

        // TODO do some validation on the file

        console.log(`Loading ${f}`);
        return await this.createBrandFile(brand);
      })
    );
  }

  private getBrandFileWriter(brandName: string) {
    if (!this.fileWriters[brandName]) {
      this.fileWriters[brandName] = new FileWriter<unknown>(brandName);
    }
    return this.fileWriters[brandName];
  }

  createBrandFile(brand: Brand) {
    return this.getBrandFileWriter(brand.name).writeBrandFile(() =>
      Promise.resolve(brand)
    );
  }
}

(async () => {
  let dataImporter = new DataImporter();
  // Load brands first, as products without brand file will create a default one
  await dataImporter.loadImportBrands();
  // Load products second
  await dataImporter.loadImportProducts();
})();
