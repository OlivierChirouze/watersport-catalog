import { Product, WindsurfBoard, WindsurfSail } from "../model";
import { ProductVariant } from "../model/variants/product-variant";
import { ObjectMerger } from "./object-merger";

export class ProductMerger<T> extends ObjectMerger<Product<T>> {
  protected specificMerge(
    keyB: string,
    objectA: Product<T>,
    objectB: Product<T>
  ) {
    if ((keyB as keyof Product<T>) === "variants") {
      // Variants
      const variants = objectA[keyB] as ProductVariant<T>[];
      (objectB[keyB] as ProductVariant<T>[]).forEach(variant => {
        const indexInA = variants.findIndex(
          variantA => compareVariants(variantA, variant) === 0
        );
        if (indexInA !== -1) {
          // A similar variant exists, let's merge their characteristics
          variants[indexInA] = this.recursiveMerge(
            keyB,
            variants[indexInA],
            variant
          ) as ProductVariant<T>;
        } else {
          // Does not exist yet, let's add it
          variants.push(variant);
        }
      });

      objectA[keyB] = this.sortArray(keyB, variants);

      return true;
    }
    return false;
  }

  protected sortArray(key: string, array: unknown[]) {
    if ((key as keyof Product<T>) === "dimensions") {
      return array.sort(compareDimensions);
    } else if ((key as keyof Product<T>) === "variants") {
      return (array as ProductVariant<T>[]).sort(compareVariants);
    }
    return super.sortArray(key, array);
  }


  protected getBestOfBoth(key: string, valA: unknown, valB: unknown): unknown {
    const variantKey = key as keyof ProductVariant<T>;
    const sailKey = key as keyof WindsurfSail<T>;
    const boardKey = key as keyof WindsurfBoard<T>;

    // Consider that measured values (in cm and in kg) can be considered identical if very close (1% diff)
    if (variantKey === "weightKg" || sailKey === "luffLengthCm" || sailKey === "boomLengthsCm" || sailKey === "mastLengthsCm" || sailKey === "mastExtensionLengthsCm" || boardKey === "widthCm") {
      if (Math.abs((valA as number) - (valB as number)) / (valA as number) <= 0.1) {
        this.warnings.push([
          `Close values for source and target for "${key}", will keep ${valA}:`,
          valA,
          valB
        ]);

        return valA;
      }
    }
    return super.getBestOfBoth(key, valA, valB);
  }
}

const getDimensionScore = (val: string) => {
  let score: number | string;
  switch (val) {
    case "edition":
      score = 0;
      break;
    case "size":
      score = 1;
      break;
    case "construction":
      score = 2;
      break;
    default:
      return val;
  }

  return score.toString();
};

const compareDimensions = (a: string, b: string) =>
  getDimensionScore(a).localeCompare(getDimensionScore(b));

const compareVariants = <T>(a: ProductVariant<T>, b: ProductVariant<T>) => {
  const toString = (a: ProductVariant<T>) =>
    JSON.stringify(a.variant, Object.keys(a.variant).sort(compareDimensions));
  return toString(a).localeCompare(toString(b));
};
