export enum Program {
  beginner= "beginner",
  kids= "kids",
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
  brandName: string; // TODO Really needed? could just be first name
  names: string[]; // Contains a list of sub names, see below
  pictureUrl?: string;
  infoUrl?: string;
  year: number;
  type: GearType;
  activities: Activity[];
  programs: Program[];
  subModels: GearSubModel[];
}

// Examples of names:
// Gaastra, Vapor Air, R, 2020, 5.6
// Gaastra, Vapor Air, SL, 2020, 5.6
// Gaastra, Vapor, 2021, 5.2
// Gaastra, Manic, 2019, 3.7, C2
// Gaastra, Manic, 2019, 4.0, C1
// Gaastra, Hybrid, 2020, 6.4, C3
// Patrik, qt-wave, GBM, 2019, 83

// Names are built:
// - brand name
// - main model name
// - bus model name
// - year
// - "main characteristic" (ex: sail surface, board volume)
// - color, if any

export interface GearSubModel {
  subNames: string[];
  pictureUrl?: string;
}

// ---------------------------------------------- Windsurfing / windfoiling sails
export enum WindsurfSailTopType {
  fixed = "fixed",
  vario = "vario"
}

export interface WindsurfSail extends GearSubModel {
  surfaceDm2: number;
  topType?: WindsurfSailTopType;
  luffLengthCm?: number;
  boomLengthCm?: number;
  possibleMastLengthsCm?: number[];
  possibleMastIMCS?: number[];
  battenCount?: number;
  camCount?: number;
  weightKg?: number;
}

// ---------------------------------------------- Windsurfing / windfoiling boards
export enum WindsurfFinBoxType {
  TuttleBox = "TuttleBox",
  DeepTuttleBox = "DeepTuttleBox",
  US5 = "US5",
  US8 = "US8"
}

export interface WindsurfBoard extends GearSubModel {
  volumeL: number;
  lengthCm?: number;
  widthCm?: number;
  weightKg?: number;
  strapInsertCount?: number;
  fins?: {
    count: number;
    type: WindsurfFinBoxType;
  }[];
  sailRange?: {
    fromDm2: number;
    toDm2: number;
  };
}
