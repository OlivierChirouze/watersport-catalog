import { isEqual } from "lodash";
import { isNotNullNotUndefined } from "../utils";

export const onlyUniqueObject = <T>(value: T, index: number, self: T[]) =>
  self.findIndex(v => compareObjects(v, value)) === index;

const isObject = v => "[object Object]" === Object.prototype.toString.call(v);

const sortObject = function(o) {
  if (Array.isArray(o)) {
    return o.sort().map(sortObject);
  } else if (isObject(o)) {
    return Object.keys(o)
      .sort()
      .reduce((a, k) => {
        a[k] = sortObject(o[k]);

        return a;
      }, {});
  }

  return o;
};

const compareObjects = (a, b) =>
  JSON.stringify(sortObject(a)) === JSON.stringify(sortObject(b));

export class ObjectMerger<U> {
  warnings: unknown[][] = [];

  merge(objectA: U, objectB: U): U {
    this.warnings = [];
    return this.recursiveMerge("", objectA, objectB) as U;
  }

  protected recursiveMerge(
    key: string,
    valueA: unknown,
    valueB: unknown
  ): unknown {
    if (isEqual(valueA, valueB)) {
      return valueA;
    }

    if (valueA === undefined) {
      return valueB;
    }

    if (valueB === undefined) {
      return valueA;
    }

    if (Array.isArray(valueA) || Array.isArray(valueB)) {
      // Arrays: just push the new values, keep only unique
      return this.sortArray(
        key,
        [...(valueA as Array<unknown>), ...(valueB as Array<unknown>)].filter(
          onlyUniqueObject
        )
      );
    }

    if (typeof valueA === "object" || typeof valueB === "object") {
      Object.keys(valueB).forEach(keyB => {
        if (this.specificMerge(keyB, valueA as U, valueB as U)) {
        } else {
          const subValueA = valueA[keyB];
          const subValueB = valueB[keyB];
          valueA[keyB] = this.recursiveMerge(keyB, subValueA, subValueB);
        }
      });

      return valueA;
    }

    return this.getBestOfBoth(key, valueA, valueB);
  }

  protected sortArray(key: string, array: unknown[]) {
    return array
      .filter(isNotNullNotUndefined)
      .sort((a, b) => a.toString().localeCompare(b.toString()));
  }

  protected getBestOfBoth(key: string, valA: unknown, valB: unknown) {
    if (valA.toString() === "") {
      return valB;
    }
    if (valB.toString() === "") {
      return valA;
    }

    if (valA !== valB) {
      /*
      this.warnings.push([
        `Different values for source and target for "${key}":`,
        valA,
        valB
      ]);
       */
      throw `Different values for source and target for "${key}": ${valA} ${valB}`;
    }

    return valB;
  }

  /**
   * Returns true if a specific merge was handled
   * @param keyB
   * @param objectA
   * @param objectB
   * @protected
   */
  protected specificMerge(keyB: string, objectA: U, objectB: U): boolean {
    return false;
  }
}
