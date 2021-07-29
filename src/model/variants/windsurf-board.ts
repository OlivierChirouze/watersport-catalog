// A windsurfing board
import {ProductVariant} from "./product-variant";

// Min and max sail surfaces
export type SailRange = {
  fromM2: number;
  toM2: number;
};

export interface WindsurfBoard<VariantType> extends ProductVariant<VariantType> {
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
