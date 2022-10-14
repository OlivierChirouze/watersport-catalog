export * from "./windsurf-sail";
export * from "./windsurf-board";
export * from "./surf-board";

// A gear variant, that is defined at least by its variant "dimensions"
export interface ProductVariant<VariantType> {
  variant: Partial<VariantType>;

  // Weight
  weightKg?: number;
}

export {FinBoxType} from "./fins";
export {FinConfig} from "./fins";
