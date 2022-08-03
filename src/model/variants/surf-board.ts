// A surf board
import { ProductVariant } from "./product-variant";

export interface SurfBoard<VariantType> extends ProductVariant<VariantType> {
  // Length of the board in feet
  lengthFt: number;
  // Length
  lengthCm?: number;
  // Width
  widthCm?: number;
  // Width
  thicknessCm?: number;
}
