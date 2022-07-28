import fs from "fs";
import path from "path";
import {Product} from "./model";
import {FileWriter} from "./file-writer";

export class DataImporter {
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
        const fileWriters: { [brandName: string]: FileWriter<unknown> } = {};
        await Promise.all(files.map(async f => {
            const data = await fs.promises.readFile(path.join(productsDir, f));
            const product = JSON.parse(data.toString()) as Product<unknown>

            // TODO do some validation on the file

            const brandName = product.brandName;
            fileWriters[brandName] ??= new FileWriter<unknown>(brandName);

            console.log(`Loading ${f}`)
            return await fileWriters[brandName].writeProductFile(product.name, product.year, () =>
                Promise.resolve(product)
            );

        }))
    }
}

(async () => {
    await new DataImporter().loadImportProducts();
})()
