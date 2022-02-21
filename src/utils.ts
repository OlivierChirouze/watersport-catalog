export const stringToNumber = (val: string): number => {
    if (val === undefined) return undefined;

    const num = Number(val.replace(",", "."));
    if (num === null) throw `Invalid number: ${val}`;

    return num;
};

export const split = (val: string) => val.split(/[-\/]+/).map(s => s.trim());

export const stringToNumberArray = (val: string): number[] => {
    if (val === undefined) return undefined;

    return split(val).map(i => stringToNumber(i));
};

export const extract = (val: string, regex: RegExp) => {
    const extracted = val.replace(regex, "$1");
    if (extracted === val) return undefined;

    return extracted;
};

export const onlyUnique = (value, index, self) => self.indexOf(value) === index;
