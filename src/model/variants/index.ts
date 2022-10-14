import { WindsurfSail } from "./windsurf-sail";
import { WindsurfBoard } from "./windsurf-board";
import { SurfBoard } from "./surf-board";
import {WingBoard} from "./wing-board";
import {Wing} from "./wing";

export * from "./windsurf-sail";
export * from "./windsurf-board";
export * from "./surf-board";

export type GearSpecificVariant<VariantType> =
  | WindsurfSail<VariantType>
  | WindsurfBoard<VariantType>
  | SurfBoard<VariantType>
  | WingBoard<VariantType>
  | Wing<VariantType>

// A gear variant, that is defined at least by its variant "dimensions"
export interface ProductVariant<VariantType> {
  variant: Partial<VariantType>;
  // Weight
  weightKg?: number;
}
export {FinBoxType} from "./fins";
export {FinConfig} from "./fins";
