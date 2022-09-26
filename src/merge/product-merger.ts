import {
  BoardType,
  FinConfig,
  GearSpecificVariant,
  Product,
  ProductSubType,
  ProductType,
  ProductVariant, PropulsionType,
  WindsurfBoard,
  WindsurfSail,
  WithConstruction,
  WithEdition,
  WithSize
} from "../model";
import { ObjectMerger } from "./object-merger";
import { filteredStringToNumber } from "../utils";

export class ProductMerger<T> extends ObjectMerger<Product<T>> {
  protected type: ProductType;
  protected subType: ProductSubType;


  merge(objectA: Product<T>, objectB:Product<T>): Product<T> {
   this.type = objectA.type;
   this.subType = objectA.subType;

   return super.merge(objectA, objectB);
  }

  protected specificMerge<U>(
    keyB: keyof U,
    objectA: U,
    objectB: U
  ) {
    if ((keyB as keyof Product<T>) === "variants") {
      const productA = objectA as unknown as Product<T>;
      const productB = objectB as unknown as Product<T>;
      const key = keyB as keyof Product<T>;
      // Variants
      const variants = productA.variants;
      productB.variants.forEach(variant => {
        const indexInA = variants.findIndex(
          variantA => this.compareVariants(variantA, variant) === 0
        );
        if (indexInA !== -1) {
          // A similar variant exists, let's merge their characteristics
          variants[indexInA] = this.recursiveMerge(
            key,
            variants[indexInA],
            variant
          ) as GearSpecificVariant<T>;
        } else {
          // Does not exist yet, let's add it
          variants.push(variant);
        }
      });

      productA.variants = this.sortArray(key, variants);

      return true;
    } else if ((keyB as keyof WindsurfBoard<T>) === "fins") {
      const boardA = objectA as unknown as WindsurfBoard<T>;
      const boardB = objectB as unknown as WindsurfBoard<T>;
      const key = keyB as keyof WindsurfBoard<T>;
      // Variants
      const fins = boardA.fins;
      boardB.fins.forEach(fin => {
        const indexInA = fins.findIndex(
          finA => this.compareFins(finA, fin) === 0
        );
        if (indexInA !== -1) {
          // A similar variant exists, let's merge their characteristics
          fins[indexInA] = this.recursiveMerge(
            key,
            fins[indexInA],
            fin
          ) as FinConfig;
        } else {
          // Does not exist yet, let's add it
          fins.push(fin);
        }
      });

      boardA.fins = this.sortArray(key, fins);

      return true;
    }
    return false;
  }

  protected sortArray<U>(key: string, array: U[]): U[] {
    if ((key as keyof Product<T>) === "dimensions") {
      const typedArray = array as unknown as (keyof T)[];
      return typedArray.sort(compareDimensions) as unknown as U[];
    } else if ((key as keyof Product<T>) === "variants") {
      const typedArray = array as unknown as GearSpecificVariant<T>[];
      return typedArray.sort(this.compareVariantTypes.bind(this)) as unknown as U[];
    }
    return super.sortArray(key, array);
  }

  protected getBestOfBoth<T>(key: string, valA: T, valB: T): T {
    const variantKey = key as keyof ProductVariant<T>;
    const sailKey = key as keyof WindsurfSail<T>;
    const boardKey = key as keyof WindsurfBoard<T>;

    // Consider that measured values (in cm and in kg) can be considered identical if very close (10% diff)
    if (
      variantKey === "weightKg" ||
      sailKey === "luffLengthCm" ||
      sailKey === "boomLengthsCm" ||
      sailKey === "mastLengthsCm" ||
      sailKey === "mastExtensionLengthsCm" ||
      boardKey === "widthCm" ||
      boardKey === "lengthCm"
    ) {
      if (
        Math.abs((valA as unknown as number) - (valB as unknown as number)) / (valA as unknown as number) <=
        0.1
      ) {
        this.warnings.push([
          `Close values for source and target for "${key}", will keep first value:`,
          valA,
          valB
        ]);

        return valA;
      }
    }
    return super.getBestOfBoth(key, valA, valB);
  }

  compareVariantTypes<VariantType>(a: ProductVariant<VariantType>, b: ProductVariant<VariantType>): number {

    // Note: variants MUST have a size, otherwise they are considered different

    const sizeA = (a as ProductVariant<WithSize>).variant.size;
    const sizeB = (b as ProductVariant<WithSize>).variant.size;
    if (sizeA === undefined) {
      return 1
    }
    if (sizeB === undefined) {
      return -1
    }
    if (sizeA !== sizeB) {
      return filteredStringToNumber(sizeA.toString()) - filteredStringToNumber(sizeB.toString());
    }

    // For construction and edition, if one has a value and not the other, they can be merged

    const constructionA = (a as ProductVariant<WithConstruction>).variant.construction;
    const constructionB = (b as ProductVariant<WithConstruction>).variant.construction;
    if (constructionA !== undefined && constructionB !== undefined && constructionA !== constructionB) {
      return constructionA.localeCompare(constructionB);
    }

    const editionA = (a as ProductVariant<WithEdition>).variant.edition;
    const editionB = (b as ProductVariant<WithEdition>).variant.edition;
    if (editionA !== undefined && editionB !== undefined && editionA !== editionB) {
      return editionA.localeCompare(editionB)
    }

    return 0;
  }

  compareVariants<T>(a: ProductVariant<T>, b: ProductVariant<T>): number {

    const toString = (a: ProductVariant<T>) =>
        JSON.stringify(a.variant, Object.keys(a.variant).sort(compareDimensions));
    const strictTypeComparison = toString(a).localeCompare(toString(b));

    if (strictTypeComparison === 0) {
      return 0;
    }

    const weakTypeComparison = this.compareVariantTypes(a, b);
    if (weakTypeComparison === 0) {

      if (this.subType === BoardType.windsurfBoard) {
        const boardA = a as ProductVariant<WithSize> as WindsurfBoard<WithSize>;
        const boardB = b as ProductVariant<WithSize> as WindsurfBoard<WithSize>;
        const isSameVariant =
          this.undefinedOrCloseEnough("volumeL", boardA, boardB)
          && this.undefinedOrCloseEnough("widthCm", boardA, boardB)
          && this.undefinedOrCloseEnough("lengthCm", boardA, boardB)
          && this.undefinedOrCloseEnough("weightKg", boardA, boardB)

        if (isSameVariant) {
          return 0;
        }
      } else if (this.subType === PropulsionType.windsurfSail) {
        const sailA = a as ProductVariant<WithSize> as WindsurfSail<WithSize>;
        const sailB = b as ProductVariant<WithSize> as WindsurfSail<WithSize>;
        const isSameVariant =
          this.undefinedOrCloseEnough("surfaceM2", sailA, sailB)
          && this.undefinedOrCloseEnough("luffLengthCm", sailA, sailB)
          && this.undefinedOrCloseEnough("weightKg", sailA, sailB)

        if (isSameVariant) {
          return 0;
        }
      }
    }

    return 1;
  }

  compareFins(a: FinConfig, b: FinConfig): number {
    if (a.type === b.type) {
      return 0;
    }

    return 1;
  }

  undefinedOrCloseEnough<T>(key: keyof T, a: T | undefined, b: T | undefined) {
    try {
      return a[key] === undefined
        || b[key] === undefined
        || this.getBestOfBoth(key as string, a[key], b[key]) === a[key]; // Will throw if too different
    } catch (e) {
      return false;
    }
  }
}

const getDimensionScore = (val: keyof (WithSize | WithEdition | WithConstruction)): string => {
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

const compareDimensions = (a: keyof (WithSize | WithEdition | WithConstruction), b: keyof (WithSize | WithEdition | WithConstruction)) =>
  getDimensionScore(a).localeCompare(getDimensionScore(b));
