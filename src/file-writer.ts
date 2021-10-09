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

    constructor(public brandName: string) {
        const param = process.argv[2];

        if (param === 'force') {
            this.forceRewrite = true;
            console.log('called with -- force option: will Overwrite files')
        }
    }

    async writeProductFile(modelName: string, modelYear: number, getProductDescription: () => Promise<Product<T>>) {
        const sanitizedBrandName = sanitize(this.brandName);
        const dir = path.join(
            path.dirname(__dirname),
            "data",
            "products",
            sanitizedBrandName);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        const fullPath = path.join(dir,
            `${sanitizedBrandName}_${sanitize(modelName)}_${modelYear}.json`
        );

        // Note: do the check here (in addition to createModelFileFromUrl) for files created from manual data
        if (!this.forceRewrite) {
            if (fs.existsSync(fullPath)) {
                console.log(`File already exists: ${fullPath}`)
                return;
            }
        }

        console.log(`\t${this.brandName} ${modelName} ${modelYear}`);

        //console.debug(JSON.stringify(model, null, 2));

        try {
            const productDescription = await getProductDescription();
            if (productDescription === undefined) {
                // There was an error during parsing, don't write file
                return
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

    async writeBrandFile(getBrand: () => Promise<Brand>): Promise<void> {
        const fullPath = path.join(
            path.dirname(__dirname),
            "data",
            "brands",
            `${sanitize(this.brandName)}.json`
        );

        if (!this.forceRewrite) {
            if (fs.existsSync(fullPath)) {
                console.log(`File already exists: ${fullPath}`)
                return;
            }
        }

        try {
            await fs.writeFile(fullPath, JSON.stringify(await getBrand(), null, 2), () => {
                //console.debug(`File written: ${fullPath}`);
            });
        } catch (e) {
            console.error(`Error writing file ${fullPath}`);
            console.error(e);
        }
    }
}
