import {WindsurfSail} from "./windsurf-sail";
import {WindsurfBoard} from "./windsurf-board";

export * from "./windsurf-sail";
export * from "./windsurf-board";

export type GearSpecificVariant<VariantType> =
  | WindsurfSail<VariantType>
  | WindsurfBoard<VariantType>;

