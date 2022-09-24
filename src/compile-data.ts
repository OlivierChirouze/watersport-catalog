import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import { Brand, Product } from "./model";
import {
  defaultOutputDir,
  FileWriter,
  ObjectToWrite,
  ProductToWrite,
  WritePolicy
} from "./file-writer";

export class DataImporter {
  private importBrandsDir: string;
  private importProductsDir: string;
  private generatedBrandsDir: string;
  private generatedProductsDir: string;
  private outputBrandsDir: string;
  private outputProductsDir: string;

  constructor(
    importDir = path.join(__dirname, "..", "data", "import"),
    generatedDir = defaultOutputDir,
    outputDir = path.join(__dirname, "..", "data", "final")
  ) {
    this.importBrandsDir = path.join(importDir, "brands");
    this.importProductsDir = path.join(importDir, "products");

    this.generatedBrandsDir = path.join(generatedDir, "brands");
    this.generatedProductsDir = path.join(generatedDir, "products");

    this.outputBrandsDir = path.join(outputDir, "brands");
    this.outputProductsDir = path.join(outputDir, "products");
  }

  async compileProducts() {
    await fs.promises.rm(this.outputProductsDir, {
      recursive: true,
      force: true
    });

    // Copy all generated files first
    await fsExtra.copy(this.generatedProductsDir, this.outputProductsDir);

    const files = await fs.promises.readdir(this.importProductsDir);

    await Promise.all(
      files.map(async f => {
        const data = await fs.promises.readFile(
          path.join(this.importProductsDir, f)
        );
        const product = JSON.parse(data.toString()) as Product<unknown>;

        // TODO do some validation on the file

        const brandName = product.brandName;
        // Create dummy brand file if needed
        await this.createBrandFile({
          name: brandName,
          links: [],
          pictures: []
        });

        console.log(`Exporting ${f}`);

        // MERGE with generated files
        const productToWrite = new ProductToWrite(
          path.join(this.outputProductsDir, FileWriter.sanitize(brandName)),
          product,
          () => Promise.resolve(product)
        ).setWritePolicy(WritePolicy.merge);

        return productToWrite.writeFile();
      })
    );
  }

  async compileBrands() {
    await fs.promises.rm(this.outputBrandsDir, {
      recursive: true,
      force: true
    });

    // Copy all generated files first
    await fsExtra.copy(this.generatedBrandsDir, this.outputBrandsDir);

    const files = await fs.promises.readdir(this.importBrandsDir);

    await Promise.all(
      files.map(async f => {
        const data = await fs.promises.readFile(
          path.join(this.importBrandsDir, f)
        );
        const brand = JSON.parse(data.toString()) as Brand;

        // TODO do some validation on the file

        console.log(`Exporting ${f}`);

        // MERGE with generated files
        return this.createBrandFile(brand);
      })
    );
  }

  createBrandFile(brand: Brand) {
    // MERGE with generated files
    const brandFile = new ObjectToWrite(
      path.join(
        this.outputBrandsDir,
        `${FileWriter.sanitize(brand.name)}.json`
      ),
      () => Promise.resolve(brand)
    ).setWritePolicy(WritePolicy.merge);

    return brandFile.writeFile();
  }
}

(async () => {
  let dataImporter = new DataImporter();

  // Load brands first, as products without brand file will create a default one
  await dataImporter.compileBrands();

  // Load products second
  await dataImporter.compileProducts();
})();
