import {isEqual} from "lodash";
import {onlyUnique} from "../utils";

export class ObjectMerger<U> {
    merge(objectA: U, objectB: U): U {
        return this.recursiveMerge(objectA, objectB) as U;
    }

    protected recursiveMerge(objectA: unknown, objectB: unknown): unknown {
        if (isEqual(objectA, objectB)) {
            return objectA
        }
        if (objectA === undefined) {
            return objectB;
        }
        Object.keys(objectB).forEach(keyB => {
            if (this.specificMerge(keyB, objectA as U, objectB as U)) {
            } else {
                const valA = objectA[keyB];
                const valB = objectB[keyB];

                if (valA === undefined) {
                    // Doesn't exist in A => replace
                    objectA[keyB] = valB;
                } else if (Array.isArray(valA) || Array.isArray(valB)) {
                    // Arrays: just push the new values, keep only unique
                    objectA[keyB] = this.sortArray(
                        keyB,
                        [...valA, ...valB]
                            .filter(onlyUnique)
                    )
                } else if (typeof valA === "object" || typeof valB === "object") {
                    // Object => recursive merge
                    objectA[keyB] = this.recursiveMerge(valA, valB)
                } else {
                    // Scalars: simply replace, but warning if different values
                    objectA[keyB] = this.getBestOfBoth(keyB, valA, valB)
                }
            }
        })

        return objectA
    }

    protected sortArray(key: string, array: unknown[]) {
        return array.sort((a, b) => (a.toString().localeCompare(b.toString())))
    }

    protected getBestOfBoth(key: string, valA: unknown, valB: unknown) {
        if (valA.toString() === '') {
            return valB;
        }
        if (valB.toString() === '') {
            return valA;
        }

        if (valA !== valB) {
            console.debug(`Different values for in source and target for "${key}":`, valA, valB)
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

