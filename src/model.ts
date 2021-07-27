export enum Program {
  beginner = "beginner",
  kids = "kids",
  wave = "wave",
  freeride = "freeride",
  freestyle = "freestyle",
  slalom = "slalom",
  race = "race"
}

export enum Activity {
  windsurf = 'windsurf',
  kitesurf = 'kitesurf',
  windfoil = 'windfoil',
  kitefoil = 'kitefoil',
  surf = 'surf',
  sup = 'sup',
  wingsurf = 'wingsurf'
}

export enum GearType {
  windsurfBoard = 'windsurfBoard',
  surfBoard = 'surfBoard',
  sail = "sail"
}

export interface GearModel {
  brandName: string;
  name: string;
  // A model can last for a few years
  years: number[];
  infoUrl?: string;
  type: GearType;
  activities: Activity[];
  programs: Program[];
  subModels: GearSubModel[];
  // Description is per language
  description: {[language: string]: string}
}

// Examples of names:
// Gaastra, Vapor Air, R, 5.6, 2020
// Gaastra, Vapor Air, SL, 5.6, 2020
// Gaastra, Vapor, 5.2, 2021
// Gaastra, Manic, 3.7, C2, 2019
// Gaastra, Manic, 4.0, C1, 2019
// Gaastra, Hybrid, 6.4, C3, 2020
// Patrik, qt-wave, GBM, 83, 2019

// Names are built:
// - brand name
// - main model name
// - bus model name
// - "main characteristic" (ex: sail surface, board volume)
// - color, if any
// - year

export interface GearSubModel {
  subNames: string[];
  // Map of 'name of color' => list of picture URLs (the list can be empty)
  colorPictureURLs: { [color: string]: string[] }
}

// ---------------------------------------------- Windsurfing / windfoiling sails
export enum WindsurfSailTopType {
  fixed = "fixed",
  vario = "vario"
}

export interface WindsurfSail extends GearSubModel {
  surfaceM2: number;
  topType?: WindsurfSailTopType;
  luffLengthCm?: number;
  boomLengthCm?: number;
  mastLengthsCm?: number[];
  mastExtensionLengthsCm?: number[];
  mastIMCS?: number[];
  battenCount?: number;
  camCount?: number;
  weightKg?: number;
}

// ---------------------------------------------- Windsurfing / windfoiling boards
export enum WindsurfFinBoxType {
  TuttleBox = "TuttleBox",
  DeepTuttleBox = "DeepTuttleBox",
  US5 = "US5",
  US8 = "US8",
  SlotBox = "SlotBox",
}

export type FinConfig = {
  count: number;
  type: WindsurfFinBoxType;
};

export type SailRange = {
  fromM2: number;
  toM2: number;
};

export interface WindsurfBoard extends GearSubModel {
  volumeL: number;
  lengthCm?: number;
  widthCm?: number;
  weightKg?: number;
  strapInsertCount?: number;
  fins?: FinConfig[];
  sailRange?: SailRange;
}
