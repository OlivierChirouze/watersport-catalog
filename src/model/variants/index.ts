import {WindsurfSail} from "./windsurf-sail";
import {WindsurfBoard} from "./windsurf-board";
import {SurfBoard} from "./surf-board";

export * from "./windsurf-sail";
export * from "./windsurf-board";
export * from "./surf-board";

export type GearSpecificVariant<VariantType> =
    | WindsurfSail<VariantType>
    | WindsurfBoard<VariantType>
    | SurfBoard<VariantType>
    ;
