// Water sport activity
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
export interface GearModel<VariantType> {
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
  variants: GearVariant<VariantType>[];
}

// A picture applies to a particular variant of the gear
// (or to any variant, if variant is empty)
export interface Picture<VariantType> {
  variant: Partial<VariantType>;
  url: string;
}

// A gear variant, that is defined at least by it's variant "dimensions"
export interface GearVariant<VariantType> {
  variant: Partial<VariantType>;
}

// ---------------------------------------------- Windsurfing / windfoiling sails

// A windsurfing sail
export interface WindsurfSail<VariantType> extends GearVariant<VariantType> {
  // The main info (the only one mandatory!): what is the surface of this sail
  surfaceM2: number;
  // Is it a fixed or vario top?
  topType?: WindsurfSailTopType;
  // Luff length
  luffLengthCm?: number;
  // Boom length
  boomLengthCm?: number;
  // The list of mast lengths that would be compatible with this sail
  mastLengthsCm?: number[];
  // The list of mast extension lengths that would be compatible with this sail
  mastExtensionLengthsCm?: number[];
  // The list of mast IMCS (Index Mast Check System) that would be compatible with this sail
  mastIMCS?: number[];
  // Number of battens
  battenCount?: number;
  // Number of cams
  camCount?: number;
  // Weight
  weightKg?: number;
}

export enum WindsurfSailTopType {
  fixed = "fixed",
  vario = "vario"
}

// ---------------------------------------------- Windsurfing / windfoiling boards

// A windsurfing board
export interface WindsurfBoard<VariantType> extends GearVariant<VariantType> {
  // The main info (the only one mandatory!): what is the volume of this board
  volumeL: number;
  // Max length
  lengthCm?: number;
  // Max width
  widthCm?: number;
  // Weight
  weightKg?: number;
  // Number of strap inserts
  strapInsertCount?: number;
  // Configuration of fins: how many of each type
  fins?: FinConfig[];
  // Compatible sails: min and max surface
  sailRange?: SailRange;
}

// Number and box types of fin boxes
export type FinConfig = {
  count: number;
  type: WindsurfFinBoxType;
};

// Types of fin box
export enum WindsurfFinBoxType {
  TuttleBox = "TuttleBox",
  DeepTuttleBox = "DeepTuttleBox",
  US5 = "US5",
  US8 = "US8",
  SlotBox = "SlotBox",
  PowerBox = "PowerBox"
}

// Min and max sail surfaces
export type SailRange = {
  fromM2: number;
  toM2: number;
};
