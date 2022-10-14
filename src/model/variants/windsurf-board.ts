// A windsurfing board
import {ProductVariant} from "./index";
import {FinConfig} from "./fins";

// Min and max sail surfaces
export type SailRange = {
  fromM2: number;
  toM2: number;
};

export interface WindsurfBoard<VariantType>
  extends ProductVariant<VariantType> {

  // The main info (the only one mandatory!): what is the volume of this board
  volumeL: number;

  // List of compatible "fin family" (foil, fins). Can be empty
  compatibleFinFamilies: FinFamily[];

  // Length
  lengthCm?: number;

  // Width
  widthCm?: number;

  // Number of strap inserts
  strapInsertCount?: number;

  // Configuration of fins: how many of each type
  fins?: FinConfig[];

  // Compatible sails: min and max surface
  sailRange?: SailRange;
}

export enum FinFamily {
  twintip = "twintip",
  foil = "foil",
  fins = "fins"
}

