import {Activity, GearSpecificVariant, GearType, Picture, Product, Program} from "./model";
import path from "path";
import fs from "fs";

export interface Parsed<T> {
    dimensions: (keyof T)[];
    variants: GearSpecificVariant<T>[];
    description: { [languageScraper: string]: string };
    pictures: Picture<T>[];
}

const sanitize = (value: string) => value.replace(/ +/, "_");

export class FileUpdater<T = any> {
    async createFileFromJson(model: {
        brandName: string;
        name: string;
        year: number;
    }) {
        const fileName = `${sanitize(model.brandName)}_${sanitize(
            model.name
        )}_${model.year}.json`;
        const fullPath = path.join(path.dirname(__dirname), "data", "products", fileName);

        //console.debug(JSON.stringify(model, null, 2));

        await fs.writeFile(fullPath, JSON.stringify(model, null, 2), () => {
            //console.debug(`File written: ${fullPath}`);
        });
    }
}

export abstract class Scraper<T> extends FileUpdater<T> {
    protected constructor(public brandName: string) {
        super();
    }

    abstract parse(url: string, modelName: string): Promise<Parsed<T>>;

    async createFileFromUrl(
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

            console.log(`${this.brandName} ${modelName} ${year}`)

            try {
                await this.createFile(
                    dimensions,
                    year,
                    modelName,
                    type,
                    url,
                    activities,
                    programs,
                    variants,
                    description,
                    pictures
                );
            } catch (e2) {
                console.error(`Error creating file for ${this.brandName} ${modelName} ${year}:`)
                console.error(e2)
            }
        } catch (e1) {
            console.error(`Error parsing ${url}:`)
            console.error(e1)
        }


    }

    async createFile(
        dimensions: (keyof T)[],
        year: number,
        modelName: string,
        type: GearType,
        url: string,
        activities: Activity[],
        programs: Program[],
        variants: GearSpecificVariant<T>[],
        description: { [p: string]: string },
        pictures: Picture<T>[]
    ) {
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

        await this.createFileFromJson(model);
    }
}
