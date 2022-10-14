// A windsurfing board
import { ProductVariant } from "./index";


export interface HandleConfig {
  // Number of handles on the boom
  boomCount: number;

  // Number of handles on the edge
  edgeCount: number;
}

export interface Wing<VariantType>
  extends ProductVariant<VariantType> {
  // The main info (the only one mandatory!): what is the surface of this sail
  surfaceM2: number;

  // Wing span in meters
  wingSpanM?: number;

  // Chord length in meters
  chordM?: number;

  // Handle config: how many handles on the boom and on the edge
  handleConfig?: HandleConfig;
}
