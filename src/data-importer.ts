import fs from "fs";
import path from "path";
import {Brand, Product} from "./model";
import {FileWriter} from "./file-writer";

export class DataImporter {
    protected fileWriters: { [brandName: string]: FileWriter<unknown> } = {};

    constructor(
        protected importDir = path.join(
            __dirname,
            "..",
            "data-import",
        )) {
    }

    async loadImportProducts() {
        const productsDir = path.join(this.importDir, "products");
        const files = (await fs.promises.readdir(productsDir));

        await Promise.all(files.map(async f => {
            const data = await fs.promises.readFile(path.join(productsDir, f));
            const product = JSON.parse(data.toString()) as Product<unknown>

            // TODO do some validation on the file

            const brandName = product.brandName;
            if (!this.fileWriters[brandName]) {
                this.fileWriters[brandName] = new FileWriter<unknown>(brandName);

                // Create dummy brand file if needed
                await this.createBrandFile({name: brandName, links: [], pictures: []});
            }

            console.log(`Loading ${f}`)
            return await this.fileWriters[brandName].writeProductFile(product.name, product.year, () =>
                Promise.resolve(product)
            );

        }))
    }

    createBrandFile(brand: Brand) {
        return this.fileWriters[brand.name].writeBrandFile(() => Promise.resolve(brand));
    }
}

(async () => {
    await new DataImporter().loadImportProducts();
})()
