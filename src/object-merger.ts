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
            } else if (objectA[keyB] === undefined) {
                // Doesn't exist in A => replace
                objectA[keyB] = objectB[keyB];
            } else if (typeof objectA[keyB] === "object") {
                // Object => recursive merge
                objectA[keyB] = this.recursiveMerge(objectA[keyB], objectB[keyB])
            } else if (Array.isArray(objectA[keyB])) {
                // Arrays: just push the new values, keep only unique
                objectA[keyB] = [...objectA[keyB], ...objectB[keyB]]
                    .filter(onlyUnique)
                    .sort((a, b) => (a.toString().localeCompare(b.toString())))
            } else {
                // Scalars: simply replace, but warning if different values
                if (objectA[keyB] !== objectB[keyB]) {
                    console.debug(`Different values for in source and target for "${keyB}":`, objectA[keyB], objectB[keyB])
                }
                objectA[keyB] = objectB[keyB]
            }
        })

        return objectA
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
            const variantsA = (objectA[keyB] as ProductVariant<T>[]);
            (objectB[keyB] as ProductVariant<T>[]).forEach(variant => {
                const indexInA = variantsA.findIndex(variantA => variantA.variant === variant.variant);
                if (indexInA !== -1) {
                    // A similar variant exists, let's merge their characteristics
                    variantsA[indexInA] = this.recursiveMerge(variantsA[indexInA], variant) as ProductVariant<T>
                } else {
                    // Does not exist yet, let's add it
                    variantsA.push(variant);
                }
            })
            return true;
        }
        return false;
    }
}
