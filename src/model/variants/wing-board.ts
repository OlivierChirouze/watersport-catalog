// A windsurfing board
import {FinConfig, ProductVariant} from "./index";


// Min and max user weight
export type WeightRange = {
  fromKg?: number;
  toKg?: number;
};

export interface WingBoard<VariantType>
  extends ProductVariant<VariantType> {

  // The main info (the only one mandatory!): what is the volume of this board
  volumeL: number;

  // Length
  lengthCm?: number;

  // Width
  widthCm?: number;

  // Thickness
  thicknessCm?: number;

  // Number of strap inserts
  strapInsertCount?: number;

  // Configuration of fins: how many of each type
  fins?: FinConfig[];

  // Recommended user weight range
  recommendedWeightRange?: WeightRange;
}
