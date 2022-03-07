import {Brand, GearSpecificVariant, Picture, Product} from "./model";
import path from "path";
import fs from "fs";
import {fileExists} from "./utils";

export interface Parsed<T> {
    dimensions: (keyof T)[];
    variants: GearSpecificVariant<T>[];
    description: { [languageScraper: string]: string };
    pictures: Picture<T>[];
}

export class ObjectToWrite<T> {
    private readonly forceRewrite: boolean;

    constructor(public fullPath: string, protected getData: () => T) {
        if (process.argv[2] === "force" || process.argv[3] === "force") {
            this.forceRewrite = true;
            console.log("called with -- force option: will Overwrite files");
        } else {
            this.forceRewrite = false;
        }
    }

    async needToWriteFile(): Promise<boolean> {
        if (!this.forceRewrite) {
            if (await fileExists(this.fullPath)) {
                console.log(`File already exists: ${this.fullPath}`);
                return false;
            }
        }
        return true;
    }

    async writeFile(): Promise<void> {
        if (!await this.needToWriteFile()) {
            return;
        }

        const dir = path.dirname(this.fullPath);
        if (!await fileExists(dir)) {
            await fs.promises.mkdir(dir, {recursive: true});
        }

        try {
            const data = await this.getData();
            if (data === undefined) {
                // There was an error during parsing, don't write file
                return;
            }
            console.log(`Writing ${path.basename(this.fullPath)}`)
            await fs.promises.writeFile(
                this.fullPath,
                JSON.stringify(data, null, 2)
            );
        } catch (e) {
            console.error(`Error writing file ${this.fullPath}`);
            console.error(e);
        }
    }
}


export class FileWriter<T> {

    static sanitize(value: string) {
        return value.replace(/ +/, "_")
    }

    constructor(public brandName: string,
                protected brandsDir = path.join(
                    path.dirname(__dirname),
                    "data",
                    "brands"
                ),
                protected productsDir = path.join(
                    path.dirname(__dirname),
                    "data",
                    "products",
                    FileWriter.sanitize(brandName)
                ),
                protected importDir = path.join(
                    __dirname,
                    "brands",
                    "import"
                )) {
    }

    async writeProductFile(
        modelName: string,
        modelYear: number,
        getProductDescription: () => Promise<Product<T>>
    ) {

        const product = new ObjectToWrite(
            path.join(this.productsDir, `${FileWriter.sanitize(this.brandName)}_${FileWriter.sanitize(modelName)}_${modelYear}.json`),
            getProductDescription
        )

        await product.writeFile();
    }

    async writeBrandFile(getBrand: () => Promise<Brand>): Promise<void> {
        const product = new ObjectToWrite(
            path.join(this.brandsDir, `${FileWriter.sanitize(this.brandName)}.json`),
            getBrand
        )
        await product.writeFile();
    }

    async loadImportFiles() {
        const regex = new RegExp(`^${FileWriter.sanitize(this.brandName)}_*`)
        const brandFiles = (await fs.promises.readdir(this.importDir)).filter(f => f.match(regex))
        await Promise.all(brandFiles.map(async f => {
            const data = await fs.promises.readFile(path.join(this.importDir, f));
            const product = JSON.parse(data.toString()) as Product<unknown>

            if (product.brandName !== this.brandName) {
                console.error(`File with unexpected brand: ${f} / ${product.brandName}`)
                return;
            }

            console.log(`Loading ${f}`)
            return await this.writeProductFile(product.name, product.year, () =>
                Promise.resolve({
                    ...product,
                    brandName: this.brandName
                })
            );

        }))
    }
}
