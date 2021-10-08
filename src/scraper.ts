import {Activity, GearSpecificVariant, GearType, Picture, Product, Program} from "./model";
import path from "path";
import fs from "fs";
import {Brand} from "./model/brand";

export interface Parsed<T> {
    dimensions: (keyof T)[];
    variants: GearSpecificVariant<T>[];
    description: { [languageScraper: string]: string };
    pictures: Picture<T>[];
}

const sanitize = (value: string) => value.replace(/ +/, "_");

export abstract class Scraper<T> {
    private forceRewrite: boolean = false;

    protected constructor(public brandName: string) {
        const param = process.argv[2];

        if (param === 'force') {
            this.forceRewrite = true;
            console.log('called with -- force option: will Overwrite files')
        }
    }

    async createModelFileFromJson(model: { name: string; year: number }) {
        const fullPath = this.getFilePath(model);

        // Note: do the check here (in addition to createModelFileFromUrl) for files created from manual data
        if (!this.forceRewrite) {
            if (fs.existsSync(fullPath)) {
                console.log(`File already exists: ${fullPath}`)
                return;
            }
        }

        console.log(`\t${this.brandName} ${model.name} ${model.year}`);

        //console.debug(JSON.stringify(model, null, 2));

        try {
            await fs.writeFile(
                fullPath,
                JSON.stringify(
                    {
                        ...model,
                        brandName: this.brandName // Inject brand name
                    },
                    null,
                    2
                ),
                () => {
                    //console.debug(`File written: ${fullPath}`);
                }
            );
        } catch (e) {
            console.error(`Error writing file ${fullPath}`);
            console.error(e);
        }
    }

    private getFilePath(model: { name: string; year: number }) {
        const fileName = `${sanitize(this.brandName)}_${sanitize(model.name)}_${
            model.year
        }.json`;

        return path.join(
            path.dirname(__dirname),
            "data",
            "products",
            fileName
        );
    }

    async createBrandFileFromJson(brand: Brand): Promise<void> {
        const fullPath = this.getBrandFilePath();

        try {
            await fs.writeFile(fullPath, JSON.stringify(brand, null, 2), () => {
                //console.debug(`File written: ${fullPath}`);
            });
        } catch (e) {
            console.error(`Error writing file ${fullPath}`);
            console.error(e);
        }
    }

    private getBrandFilePath() {
        const fileName = `${sanitize(this.brandName)}.json`;
        return path.join(
            path.dirname(__dirname),
            "data",
            "brands",
            fileName
        );
    }

    protected abstract getBrandInfo(): Promise<Brand>;

    abstract parse(url: string, modelName: string): Promise<Parsed<T>>;

    async createBrandFile(): Promise<void> {
        console.log(`${this.brandName}`);
        if (!this.forceRewrite) {
            const filePath = this.getBrandFilePath();
            if (fs.existsSync(filePath)) {
                console.log(`File already exists: ${filePath}`)
                return;
            }
        }
        const brand = await this.getBrandInfo();
        return this.createBrandFileFromJson(brand);
    }

    async createModelFileFromUrl(
        url: string,
        modelName: string,
        year: number,
        activities: Activity[],
        type: GearType,
        programs: Program[]
    ) {
        if (!this.forceRewrite) {
            const filePath = this.getFilePath({name: modelName, year: year});
            if (fs.existsSync(filePath)) {
                console.log(`File already exists: ${filePath}`)
                return;
            }
        }

        try {
            const {dimensions, variants, description, pictures} = await this.parse(
                url,
                modelName
            );

            try {
                const model: Product<T> = {
                    dimensions,
                    brandName: this.brandName,
                    year,
                    name: modelName,
                    type,
                    infoUrl: url,
                    activities,
                    programs,
                    variants,
                    description,
                    pictures
                };
                await this.createModelFileFromJson(model);
            } catch (e2) {
                console.error(
                    `Error creating file for ${this.brandName} ${modelName} ${year}:`
                );
                console.error(e2);
            }
        } catch (e1) {
            console.error(`Error parsing ${url}:`);
            console.error(e1);
        }
    }
}
