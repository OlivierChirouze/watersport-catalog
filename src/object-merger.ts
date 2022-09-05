import {Product} from "./model";
import {isEqual} from "lodash";
import {onlyUnique} from "./utils";
import {ProductVariant} from "./model/variants/product-variant";

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

export class ProductMerger<T> extends ObjectMerger<Product<T>> {
    protected specificMerge(keyB: string, objectA: Product<T>, objectB: Product<T>) {
        if (keyB as keyof Product<T> === "variants") {
            // Variants
            const variants = (objectA[keyB] as ProductVariant<T>[]);
            (objectB[keyB] as ProductVariant<T>[]).forEach(variant => {
                const indexInA = variants.findIndex(variantA => variantA.variant === variant.variant);
                if (indexInA !== -1) {
                    // A similar variant exists, let's merge their characteristics
                    variants[indexInA] = this.recursiveMerge(variants[indexInA], variant) as ProductVariant<T>
                } else {
                    // Does not exist yet, let's add it
                    variants.push(variant);
                }
            })

            objectA[keyB] = this.sortArray(keyB, variants);

            return true;
        }
        return false;
    }

    protected sortArray(key: string, array: unknown[]) {
        const getScore = (val: string) => {
            let score: number | string;
            switch (val) {
                case 'edition':
                    score = 0
                    break;
                case 'size':
                    score = 1
                    break;
                case 'construction':
                    score = 2
                    break;
                default:
                    return val;
            }

            return score.toString();
        }
        const compareVariants = (a: string, b: string) => getScore(a).localeCompare(getScore(b))

        if (key as keyof Product<T> === 'dimensions') {

            return array.sort(compareVariants)
        } else if (key as keyof Product<T> === 'variants') {
            const toString = (a: ProductVariant<T>) => JSON.stringify(a.variant, Object.keys(a.variant).sort(compareVariants))
            return (array as ProductVariant<T>[]).sort((a, b) => toString(a).localeCompare(toString(b)))
        }
        return super.sortArray(key, array);
    }
}
