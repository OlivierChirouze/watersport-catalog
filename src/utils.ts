import fs from "fs";

export const stringToNumber = (val: string): number => {
    if (val === undefined) return undefined;

    const num = Number(val.replace(",", "."));
    if (num === null) throw `Invalid number: ${val}`;

    return num;
};

export const split = (val: string) => val.split(/[-\/]+/).map(s => s.trim());

/**
 * Map a string value to a list of integers,
 * considering all values in the split are already numbers
 * @param val
 */
export const stringToNumberArray = (val: string): number[] => {
    if (val === undefined) return undefined;

    return split(val)
        .map(i => stringToNumber(i))
        .filter(onlyUnique)
};

/**
 * Map a string value to a list of integers,
 * filtering out all values in the split that are not proper numbers
 * @param val
 */
export const stringToNumberArrayFiltered = (val: string): number[] => {
    if (val === undefined) return undefined;

    return split(val)
        .map(s => s.replace(/[^0-9]*/g, ''))
        .filter(n => n !== '')
        .map(stringToNumber)
        .filter(onlyUnique)
}

export const extract = (val: string, regex: RegExp) => {
    const extracted = val.replace(regex, "$1");
    if (extracted === val) return undefined;

    return extracted;
};

export const onlyUnique = (value, index, self) => self.indexOf(value) === index;

export const fileExists = async path => {
    // the result can be either false (from the caught error) or it can be an fs.stats object
    const result = await fs.promises.stat(path).catch(err => {
        if (err.code === "ENOENT") {
            return false;
        }
        throw err;
    });

    return result !== false
};
