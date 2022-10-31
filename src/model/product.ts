// Water sport activity
import { ProductVariant } from "./variants";
import { isEqual } from "lodash";

// "type" of activity
export enum Program {
  beginner = "beginner",
  kids = "kids",
  wave = "wave",
  freeride = "freeride",
  freestyle = "freestyle",
  slalom = "slalom",
  race = "race",
  foiling = "foiling"
}

export enum ProductType {
  board = "board",
  propulsion = "propulsion"
}

export type ProductSubType = BoardType | PropulsionType;

// A product can be either a propulsion or a board
export enum PropulsionType {
  windsurfSail = "windsurfSail",
  kite = "kite",
  wing = "wing"
}

export enum BoardType {
  windsurfBoard = "windsurfBoard",
  surfBoard = "surfBoard",
  kiteBoard = "kiteBoard",
  paddleBoard = "paddleBoard",
  wingBoard = "wingBoard"
}

// This is the actual product a brand is selling
// The VariantType should be a simple type with a few properties. It's the type that makes
// all "variants" of this gear, unique
// Example:
// interface MyVariant {
//   size: number;
//   construction: string;
// }
export interface Product<VariantType, Type extends ProductVariant<VariantType> = ProductVariant<VariantType>> {
  // Type and sub-type
  type: ProductType;
  subType: ProductSubType;

  // Name of the brand
  brandName: string;

  // A name should be unique for a brand a year and a version
  name: string;

  // 1st release year. Can remain a few years at the catalogue
  year: number;

  // Some product have a version that lasts for many years
  version?: string;

  // URL to get more info about the product
  infoUrl?: string;

  // Main programs the gear is targeting
  programs: Program[];

  // Description is per language
  description: { [language: string]: string };

  // List of pictures that are more or less specific to a variant
  pictures: Picture<VariantType>[];

  // List of keys that define "variants" of this gear.
  // Example: ['size', 'construction'] means you expect variants to have different size and construction values
  dimensions: (keyof VariantType)[];

  // The actual variants of this gear
  // Each variant has a "variant" property, of type VariantType, that defines how this variant is "unique"
  variants: Type[];
}

// A picture applies to a particular variant of the gear
// (or to any variant, if variant is empty)
export interface Picture<VariantType> {
  variant: Partial<VariantType>;
  url: string;
}

/**
 * Look for the variant in list that is the closest to the provided variant.
 * Could be the exact same variant, or one with "more general" variant
 * @param search
 * @param listOfVariants
 */
export const getClosestVariant = <VariantType,
  P extends { variant: Partial<VariantType> }>(
  search: Partial<VariantType>,
  listOfVariants: P[]
): P | undefined => {
  const searchKeys = Object.keys(search);
  if (searchKeys.length === 0) return undefined;

  // Try to find an exact match
  let find = listOfVariants.find(v => isEqual(v.variant, search));

  if (find) return find;

  // As a fallback, compare each key: if they are different, it's a no go. Otherwise, keep the variant that has the most common values
  return listOfVariants.map(variant => {
    let score = 0;
    for (let i = 0; i < searchKeys.length; i++) {
      const key = searchKeys[i];
      if (variant.variant[key] !== undefined) {
        if (variant.variant[key] === search[key]) {
          // The variant is equal on this key => increase score
          score++;
        } else {
          // The variant has a different value => score is zero
          score = 0;
          break;
        }
      }
      // Otherwise if the variant doesn't have this key, don't change the score
    }

    return {
      variant,
      score
    };
  })
    // Keep only variants that don't have a different value
    .filter(v => v.score !== 0)
    // Take the highest match score if it exists
    .sort((vA, vB) => vA.score - vB.score)
    [0]?.variant;
};

export interface WithSize {
  size: string;
}

export interface WithEdition {
  edition: string;
}

export interface WithConstruction {
  construction: string;
}
