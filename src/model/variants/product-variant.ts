// A gear variant, that is defined at least by its variant "dimensions"
export interface ProductVariant<VariantType> {
  variant: Partial<VariantType>;
}
