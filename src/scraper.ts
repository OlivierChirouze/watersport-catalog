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
    protected constructor(public brandName: string) {
    }

    async createModelFileFromJson(model: { name: string; year: number }) {
        const fileName = `${sanitize(this.brandName)}_${sanitize(model.name)}_${
            model.year
        }.json`;
        const fullPath = path.join(
            path.dirname(__dirname),
            "data",
            "products",
            fileName
        );

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

    async createBrandFileFromJson(brand: Brand): Promise<void> {
        const fileName = `${sanitize(brand.name)}.json`;
        const fullPath = path.join(
            path.dirname(__dirname),
            "data",
            "brands",
            fileName
        );

        try {
            await fs.writeFile(fullPath, JSON.stringify(brand, null, 2), () => {
                //console.debug(`File written: ${fullPath}`);
            });
        } catch (e) {
            console.error(`Error writing file ${fullPath}`);
            console.error(e);
        }
    }

    protected abstract getBrandInfo(): Promise<Brand>;

    abstract parse(url: string, modelName: string): Promise<Parsed<T>>;

    async createBrandFile(): Promise<void> {
        console.log(`${this.brandName}`);
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
