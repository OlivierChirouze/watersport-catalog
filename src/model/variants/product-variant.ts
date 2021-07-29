// A gear variant, that is defined at least by it's variant "dimensions"
export interface ProductVariant<VariantType> {
  variant: Partial<VariantType>;
}
