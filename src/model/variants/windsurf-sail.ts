// A windsurfing sail
import {ProductVariant} from "./product-variant";

export enum WindsurfSailTopType {
  fixed = "fixed",
  vario = "vario"
}

export enum MastType {
  RMD = "RMD",
  SDM = "SDM"
}

export interface WindsurfSail<VariantType> extends ProductVariant<VariantType> {
  // The main info (the only one mandatory!): what is the surface of this sail
  surfaceM2: number;
  // Is it a fixed or vario top?
  topType?: WindsurfSailTopType;
  // Luff length
  luffLengthCm?: number;
  // Boom length
  boomLengthsCm?: number[];
  // Type of mast (RDM or SDM)
  masTypes?: MastType[];
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
