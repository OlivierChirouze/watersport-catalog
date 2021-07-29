// Water sport activity
import {GearSpecificVariant} from "./variants";

export enum Activity {
  windsurf = "windsurf",
  kitesurf = "kitesurf",
  windfoil = "windfoil",
  kitefoil = "kitefoil",
  surf = "surf",
  sup = "sup",
  wingsurf = "wingsurf"
}

// "type" of activity
export enum Program {
  beginner = "beginner",
  kids = "kids",
  wave = "wave",
  freeride = "freeride",
  freestyle = "freestyle",
  slalom = "slalom",
  race = "race"
}

// Big categories of gear, regardless of the activity
// example: a "windsurf board" (GearType) can in fact be used for windfoiling (Activity)
export enum GearType {
  windsurfBoard = "windsurfBoard",
  sail = "sail"
  // surfBoard = 'surfBoard',
  // kite = "kite"
  // ... to be continued!
}

// This is the actual product a brand is selling
// The VariantType should be a simple type with a few properties. It's the type that makes
// all "variants" of this gear, unique
// Example:
// interface MyVariant {
//   size: number;
//   construction: string;
// }
export interface Product<VariantType> {
  type: GearType;
  brandName: string;
  // A name should be unique for a brand and a year range
  name: string;
  // A model can last for a few years
  years: number[];
  infoUrl?: string;
  // Gears can apply to multiple activities (ex: windsurfing and windfoiling)
  activities: Activity[];
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
  variants: GearSpecificVariant<VariantType>[];
}

// A picture applies to a particular variant of the gear
// (or to any variant, if variant is empty)
export interface Picture<VariantType> {
  variant: Partial<VariantType>;
  url: string;
}

