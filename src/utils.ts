const defaultSeparator = /[-\/]+/;

export const stringToNumber = (val: string): number => {
  if (val === undefined || val === null) return undefined;

  const num = Number(val.replace(",", "."));
  if (num === null || isNaN(num)) throw `Invalid number: ${val}`;

  return num;
};

export const filteredStringToNumber = (val: string): number => {
  // Take the first number in the string, if any
  return stringToNumber(val?.match(/\b[\d.,]+\b/)?.[0])
};

export const split = (
    val: string,
    separator: string | RegExp = defaultSeparator
) => val.split(separator).map(s => s.trim());

/**
 * Map a string value to a list of integers,
 * considering all values in the split are already numbers
 * @param val
 * @param separator
 */
export const stringToNumberArray = (
  val: string,
  separator: string | RegExp = defaultSeparator
): number[] => {
  if (val === undefined) return undefined;

  return split(val, separator)
    .map(stringToNumber)
    .filter(onlyUnique);
};

export const isNotNullNotUndefined = <T>(val: T | undefined) =>
  val !== null && val !== undefined;

/**
 * Map a string value to a list of integers,
 * filtering out all values in the split that are not proper numbers
 * @param val
 * @param separator
 */
export const stringToNumberArrayFiltered = (
  val: string,
  separator: string | RegExp = defaultSeparator
): number[] => {
  if (val === undefined) return undefined;

  return split(val, separator)
      .filter(isNotNullNotUndefined)
      .map(i => filteredStringToNumber(i))
    .filter(onlyUnique);
};

export const extract = (val: string, regex: RegExp) => {
  const extracted = val.replace(regex, "$1");
  if (extracted === val) return undefined;

  return extracted;
};

export const onlyUnique = (value, index, self) => self.indexOf(value) === index;
