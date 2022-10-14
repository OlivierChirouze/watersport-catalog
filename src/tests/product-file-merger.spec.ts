import {
  BoardType,
  FinFamily,
  Product,
  ProductType,
  Program,
  FinBoxType,
  WindsurfBoard,
  PropulsionType, ProductVariant, WindsurfSail
} from "../index";
import { ProductMerger } from "../merge/product-merger";

type SizeAndConstruction = {
  construction: string;
  size: number;
};

type SizeAndEdition = {
  edition: string;
  size: number;
};

describe("product-file-merger", () => {
  let productA: Product<SizeAndConstruction, WindsurfBoard<SizeAndConstruction>>;
  let productB: Product<SizeAndConstruction, WindsurfBoard<SizeAndConstruction>>;

  const merger = new ProductMerger<SizeAndConstruction>();

  beforeEach(() => {
    productA = {
      dimensions: ["size", "construction"],
      brandName: "JP Australia",
      year: 2017,
      name: "Super Sport",
      type: ProductType.board,
      subType: BoardType.windsurfBoard,
      programs: [Program.race],
      variants: [
        {
          variant: {
            size: 101,
            construction: "Pro"
          },
          lengthCm: 237,
          widthCm: 64,
          volumeL: 101,
          weightKg: 6.5,
          fins: [
            {
              count: 1,
              type: FinBoxType.TuttleBox
            }
          ],
          compatibleFinFamilies: [FinFamily.fins]
        },
        {
          variant: {
            size: 113,
            construction: "Pro"
          },
          lengthCm: 237,
          widthCm: 70,
          volumeL: 113,
          weightKg: 7,
          fins: [
            {
              count: 1,
              type: FinBoxType.TuttleBox
            }
          ],
          compatibleFinFamilies: [FinFamily.fins]
        },
        {
          variant: {
            size: 125,
            construction: "Gold"
          },
          lengthCm: 237,
          widthCm: 76,
          volumeL: 125,
          fins: [
            {
              count: 1,
              type: FinBoxType.TuttleBox
            }
          ],
          compatibleFinFamilies: [FinFamily.fins]
        },
        {
          variant: {
            size: 125,
            construction: "Pro"
          },
          lengthCm: 237,
          widthCm: 76,
          volumeL: 125,
          weightKg: 7.5,
          fins: [
            {
              count: 1,
              type: FinBoxType.TuttleBox
            }
          ],
          compatibleFinFamilies: [FinFamily.fins]
        },
        {
          variant: {
            size: 137,
            construction: "Pro"
          },
          lengthCm: 237,
          widthCm: 82,
          volumeL: 137,
          weightKg: 7.9,
          fins: [
            {
              count: 1,
              type: FinBoxType.TuttleBox
            }
          ],
          compatibleFinFamilies: [FinFamily.fins]
        }
      ],
      description: {},
      pictures: []
    };
  });

  describe("merge", () => {
    it("should merge empty", () => {
      productB = {
        brandName: "",
        description: {},
        dimensions: [],
        name: "",
        pictures: [],
        programs: [],
        subType: undefined,
        type: undefined,
        variants: [],
        year: 2017
      };

      expect(merger.merge(productB, productA)).toEqual(productA);
      expect(merger.merge(productA, productB)).toEqual(productA);
    });

    it("should add variant and programs", () => {
      productB = {
        dimensions: [],
        brandName: "JP Australia",
        year: 2017,
        name: "Super Sport",
        type: ProductType.board,
        subType: BoardType.windsurfBoard,
        programs: [Program.freeride],
        variants: [
          {
            variant: {
              size: 125,
              construction: "other"
            },
            lengthCm: 237,
            widthCm: 76,
            volumeL: 125,
            weightKg: 6.6,
            fins: [
              {
                count: 2,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          }
        ],
        description: { en: "this is my description" },
        pictures: []
      };

      let expected: Product<SizeAndConstruction, WindsurfBoard<SizeAndConstruction>> = {
        dimensions: ["size", "construction"],
        brandName: "JP Australia",
        year: 2017,
        name: "Super Sport",
        type: ProductType.board,
        subType: BoardType.windsurfBoard,
        programs: [Program.freeride, Program.race],
        variants: [
          {
            variant: {
              size: 101,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 64,
            volumeL: 101,
            weightKg: 6.5,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 113,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 70,
            volumeL: 113,
            weightKg: 7,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 125,
              construction: "Gold"
            },
            lengthCm: 237,
            widthCm: 76,
            volumeL: 125,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 125,
              construction: "other"
            },
            lengthCm: 237,
            widthCm: 76,
            volumeL: 125,
            weightKg: 6.6,
            fins: [
              {
                count: 2,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 125,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 76,
            volumeL: 125,
            weightKg: 7.5,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 137,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 82,
            volumeL: 137,
            weightKg: 7.9,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          }
        ],
        description: { en: "this is my description" },
        pictures: []
      };

      expect(merger.merge(productA, productB)).toEqual(expected);
      expect(merger.merge(productB, productA)).toEqual(expected);
    });

    it("should update variant", () => {
      productB = {
        dimensions: [],
        brandName: "JP Australia",
        year: 2017,
        name: "Super Sport",
        type: ProductType.board,
        subType: BoardType.windsurfBoard,
        programs: [],
        variants: [
          {
            variant: {
              size: 125,
              construction: "Gold"
            },
            weightKg: 6.6, // Notice weight is new
            volumeL: 125,
            fins: [],
            compatibleFinFamilies: []
          }
        ],
        description: {},
        pictures: []
      };

      let expected: Product<SizeAndConstruction, WindsurfBoard<SizeAndConstruction>> = {
        dimensions: ["size", "construction"],
        brandName: "JP Australia",
        year: 2017,
        name: "Super Sport",
        type: ProductType.board,
        subType: BoardType.windsurfBoard,
        programs: [Program.race],
        variants: [
          {
            variant: {
              size: 101,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 64,
            volumeL: 101,
            weightKg: 6.5,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 113,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 70,
            volumeL: 113,
            weightKg: 7,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 125,
              construction: "Gold"
            },
            lengthCm: 237,
            widthCm: 76,
            volumeL: 125,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins],
            weightKg: 6.6 // Notice weight is new
          },
          {
            variant: {
              size: 125,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 76,
            volumeL: 125,
            weightKg: 7.5,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          },
          {
            variant: {
              size: 137,
              construction: "Pro"
            },
            lengthCm: 237,
            widthCm: 82,
            volumeL: 137,
            weightKg: 7.9,
            fins: [
              {
                count: 1,
                type: FinBoxType.TuttleBox
              }
            ],
            compatibleFinFamilies: [FinFamily.fins]
          }
        ],
        description: {},
        pictures: []
      };

      expect(merger.merge(productA, productB)).toEqual(expected);
      expect(merger.merge(productB, productA)).toEqual(expected);
      //
    });

    it("should handle similar variants", () => {
      const productOne: Product<SizeAndConstruction, WindsurfBoard<SizeAndConstruction>> = {
        "dimensions": [
          "size",
          "construction"
        ],
        pictures: [],
        "brandName": "AHD",
        "year": 2015,
        "name": "SL-2",
        type: ProductType.board,
        subType: BoardType.windsurfBoard,
        "programs": [
          Program.race
        ],
        "variants": [
          {
            "variant": {
              "size": 112,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 236,
            "widthCm": 68,
            "volumeL": 112,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          },
          {
            "variant": {
              "size": 92,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 238,
            "widthCm": 59.6,
            "volumeL": 92,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          },
          {
            "variant": {
              "size": 122,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 234.5,
            "widthCm": 76,
            "volumeL": 122,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          },
          {
            "variant": {
              "size": 132,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 233,
            "widthCm": 79.6,
            "volumeL": 132,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          }
        ],
        "description": {},
      };

      const productTwo : Product<SizeAndConstruction, WindsurfBoard<SizeAndConstruction>> = {
        "name": "SL-2",
        "year": 2015,
        "programs": [
          Program.slalom
        ],
        pictures: [],
        "brandName": "AHD",
        type: ProductType.board,
        subType: BoardType.windsurfBoard,
        "description": {},
        "dimensions": [
          "size"
        ],
        "variants": [
          {
            "variant": {
              "size": 92
            },
            "compatibleFinFamilies": [
              FinFamily.fins
            ],
            "volumeL": 92,
            "lengthCm": 238,
            "widthCm": 59.6,
            "weightKg": 6,
            "fins": [
              {
                "type": FinBoxType.DeepTuttleBox
              }
            ]
          },
          {
            "variant": {
              "size": 112
            },
            "compatibleFinFamilies": [
              FinFamily.fins
            ],
            "volumeL": 112,
            "lengthCm": 236,
            "widthCm": 68,
            "weightKg": 6.5,
            "fins": [
              {
                "type": FinBoxType.DeepTuttleBox
              }
            ]
          },
          {
            "variant": {
              "size": 122
            },
            "compatibleFinFamilies": [
              FinFamily.fins
            ],
            "volumeL": 122,
            "lengthCm": 234.5,
            "widthCm": 76,
            "weightKg": 7,
            "fins": [
              {
                "type": FinBoxType.DeepTuttleBox
              }
            ]
          },
          {
            "variant": {
              "size": 132
            },
            "compatibleFinFamilies": [
              FinFamily.fins
            ],
            "volumeL": 132,
            "lengthCm": 233,
            "widthCm": 79.6,
            "weightKg": 7.5,
            "fins": [
              {
                "type": FinBoxType.DeepTuttleBox
              }
            ]
          }
        ]
      }

      const expected = {
        "dimensions": [
          "size",
          "construction"
        ],
        pictures: [],
        "brandName": "AHD",
        "year": 2015,
        "name": "SL-2",
        type: ProductType.board,
        subType: BoardType.windsurfBoard,
        "programs": [
          "race",
          "slalom"
        ],
        "variants": [
          {
            "variant": {
              "size": 92,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 238,
            "widthCm": 59.6,
            "weightKg": 6,
            "volumeL": 92,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          },
          {
            "variant": {
              "size": 112,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 236,
            "widthCm": 68,
            "volumeL": 112,
            "weightKg": 6.5,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          },
          {
            "variant": {
              "size": 122,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 234.5,
            "widthCm": 76,
            "weightKg": 7,
            "volumeL": 122,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          },
          {
            "variant": {
              "size": 132,
              "construction": "Double Sandwich Full Carbon"
            },
            "lengthCm": 233,
            "widthCm": 79.6,
            "weightKg": 7.5,
            "volumeL": 132,
            "fins": [
              {
                "count": 1,
                "type": FinBoxType.DeepTuttleBox
              }
            ],
            "compatibleFinFamilies": [
              FinFamily.fins
            ]
          }
        ],
        "description": {},
      };

      expect(merger.merge(productOne as Product<SizeAndConstruction>, productTwo as Product<SizeAndConstruction>)).toEqual(expected);
    })

    it("should handle similar variants with new edition", () => {
      const productOne: Product<SizeAndEdition, WindsurfSail<SizeAndEdition> > = {
        "name": "Charge",
        "year": 2010,
        "programs": [
          Program.wave
        ],
        "brandName": "Aerotech",
        type: ProductType.propulsion,
        subType: PropulsionType.windsurfSail,
        "description": {},
        "dimensions": [
          "size",
          "edition"
        ],
        "variants": [
          {
            "variant": {
              "size": 5,
              "edition": "Technora"
            },
            "surfaceM2": 5,
            "luffLengthCm": 479,
            "mastLengthsCm": [
              430
            ],
            "mastIMCS": [
              21
            ],
            "boomLengthsCm": [
              165
            ],
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 5.5,
              "edition": "Technora"
            },
            "surfaceM2": 5.5,
            "luffLengthCm": 433,
            "mastLengthsCm": [
              430
            ],
            "mastIMCS": [
              21
            ],
            "boomLengthsCm": [
              177
            ],
            "battenCount": 5,
            "camCount": 0
          }
        ],
        pictures: []
      }

      const productTwo: Product<SizeAndEdition, WindsurfSail<SizeAndEdition> > = {
        "name": "Charge",
        "year": 2010,
        "programs": [
          Program.wave
        ],
        "brandName": "Aerotech",
        type: ProductType.propulsion,
        subType: PropulsionType.windsurfSail,
        "description": {},
        "dimensions": [
          "size"
        ],
        "variants": [
          {
            "variant": {
              "size": 3.2
            },
            "surfaceM2": 3.2,
            "luffLengthCm": 338,
            "mastLengthsCm": [
              370
            ],
            "boomLengthsCm": [
              144
            ],
            "weightKg": 3.1,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 3.5
            },
            "surfaceM2": 3.5,
            "luffLengthCm": 357,
            "mastLengthsCm": [
              370
            ],
            "boomLengthsCm": [
              145
            ],
            "weightKg": 3.2,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 3.75
            },
            "surfaceM2": 3.75,
            "luffLengthCm": 357,
            "mastLengthsCm": [
              370
            ],
            "boomLengthsCm": [
              149
            ],
            "weightKg": 3.3,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 4
            },
            "surfaceM2": 4,
            "luffLengthCm": 377,
            "mastLengthsCm": [
              370
            ],
            "boomLengthsCm": [
              154
            ],
            "weightKg": 3.6,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 4.25
            },
            "surfaceM2": 4.25,
            "luffLengthCm": 387,
            "mastLengthsCm": [
              400
            ],
            "boomLengthsCm": [
              159
            ],
            "weightKg": 3.7,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 4.5
            },
            "surfaceM2": 4.5,
            "luffLengthCm": 399,
            "mastLengthsCm": [
              400
            ],
            "boomLengthsCm": [
              161
            ],
            "weightKg": 3.8,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 4.75
            },
            "surfaceM2": 4.75,
            "luffLengthCm": 407,
            "mastLengthsCm": [
              400
            ],
            "boomLengthsCm": [
              164
            ],
            "weightKg": 3.9,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 5
            },
            "surfaceM2": 5,
            "luffLengthCm": 414,
            "mastLengthsCm": [
              430
            ],
            "boomLengthsCm": [
              165
            ],
            "weightKg": 3.9,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 5.25
            },
            "surfaceM2": 5.25,
            "luffLengthCm": 424,
            "mastLengthsCm": [
              430
            ],
            "boomLengthsCm": [
              170
            ],
            "weightKg": 3.9,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 5.8
            },
            "surfaceM2": 5.8,
            "luffLengthCm": 444,
            "mastLengthsCm": [
              460
            ],
            "boomLengthsCm": [
              177
            ],
            "weightKg": 4.2,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 6.2
            },
            "surfaceM2": 6.2,
            "luffLengthCm": 463,
            "mastLengthsCm": [
              460
            ],
            "mastIMCS": [
              25
            ],
            "boomLengthsCm": [
              182
            ],
            "weightKg": 4.3,
            "battenCount": 5,
            "camCount": 0
          },
          {
            "variant": {
              "size": 6.6
            },
            "surfaceM2": 6.6,
            "luffLengthCm": 479,
            "mastLengthsCm": [
              460
            ],
            "mastIMCS": [
              25
            ],
            "boomLengthsCm": [
              188
            ],
            "battenCount": 5,
            "camCount": 0
          }
        ],
        pictures: []
      }

      const expected: Product<SizeAndEdition, WindsurfSail<SizeAndEdition> > = {
        "name": "Charge",
        "year": 2010,
        "programs": [
          Program.wave
        ],
        "brandName": "Aerotech",
        type: ProductType.propulsion,
        subType: PropulsionType.windsurfSail,
        "description": {},
        "dimensions": [
          "edition",
          "size"
        ],
        "variants": [
          { "variant": { "size": 3.2 }, "surfaceM2": 3.2, "luffLengthCm": 338, "mastLengthsCm": [370], "boomLengthsCm": [144], "weightKg": 3.1, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 3.5 }, "surfaceM2": 3.5, "luffLengthCm": 357, "mastLengthsCm": [370], "boomLengthsCm": [145], "weightKg": 3.2, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 3.75 }, "surfaceM2": 3.75, "luffLengthCm": 357, "mastLengthsCm": [370], "boomLengthsCm": [149], "weightKg": 3.3, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 4 }, "surfaceM2": 4, "luffLengthCm": 377, "mastLengthsCm": [370], "boomLengthsCm": [154], "weightKg": 3.6, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 4.25 }, "surfaceM2": 4.25, "luffLengthCm": 387, "mastLengthsCm": [400], "boomLengthsCm": [159], "weightKg": 3.7, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 4.5 }, "surfaceM2": 4.5, "luffLengthCm": 399, "mastLengthsCm": [400], "boomLengthsCm": [161], "weightKg": 3.8, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 4.75 }, "surfaceM2": 4.75, "luffLengthCm": 407, "mastLengthsCm": [400], "boomLengthsCm": [164], "weightKg": 3.9, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 5, "edition": "Technora" }, "surfaceM2": 5, "luffLengthCm": 479, "mastLengthsCm": [430], "mastIMCS": [21], "boomLengthsCm": [165], "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 5 }, "surfaceM2": 5, "luffLengthCm": 414, "mastLengthsCm": [430], "boomLengthsCm": [165], "weightKg": 3.9, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 5.25 }, "surfaceM2": 5.25, "luffLengthCm": 424, "mastLengthsCm": [430], "boomLengthsCm": [170], "weightKg": 3.9, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 5.5, "edition": "Technora" }, "surfaceM2": 5.5, "luffLengthCm": 433, "mastLengthsCm": [430], "mastIMCS": [21], "boomLengthsCm": [177], "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 5.8 }, "surfaceM2": 5.8, "luffLengthCm": 444, "mastLengthsCm": [460], "boomLengthsCm": [177], "weightKg": 4.2, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 6.2 }, "surfaceM2": 6.2, "luffLengthCm": 463, "mastLengthsCm": [460], "mastIMCS": [25], "boomLengthsCm": [182], "weightKg": 4.3, "battenCount": 5, "camCount": 0 },
          { "variant": { "size": 6.6 }, "surfaceM2": 6.6, "luffLengthCm": 479, "mastLengthsCm": [460], "mastIMCS": [25], "boomLengthsCm": [188], "battenCount": 5, "camCount": 0 }
        ],
        pictures: []
      }

      expect(merger.merge(productOne as Product<SizeAndConstruction>, productTwo as Product<SizeAndConstruction>)).toEqual(expected);
    })

    it("should not merge similar variants if different", () => {
      const productOne: Product<SizeAndEdition, WindsurfSail<SizeAndEdition> > = {
        "name": "Charge",
        "year": 2010,
        "programs": [
          Program.wave
        ],
        "brandName": "Aerotech",
        type: ProductType.propulsion,
        subType: PropulsionType.windsurfSail,
        "description": {},
        "dimensions": [
          "size",
          "edition"
        ],
        "variants": [
          {
            "variant": {
              "size": 5,
            },
            "surfaceM2": 5,
            "luffLengthCm": 479,
            "mastLengthsCm": [
              430
            ],
            "mastIMCS": [
              21
            ],
            "boomLengthsCm": [
              165
            ],
            "battenCount": 5,
            "camCount": 0
          }
        ],
        pictures: []
      }

      const productTwo: Product<SizeAndConstruction, WindsurfSail<SizeAndConstruction> > = {
        "name": "Charge",
        "year": 2010,
        "programs": [
          Program.wave
        ],
        "brandName": "Aerotech",
        type: ProductType.propulsion,
        subType: PropulsionType.windsurfSail,
        "description": {},
        "dimensions": [
          "size"
        ],
        "variants": [
          {
            "variant": {
              "size": 5,
            },
            "surfaceM2": 5,
            "luffLengthCm": 550, // Very different luff
            "mastLengthsCm": [
              430
            ],
            "mastIMCS": [
              21
            ],
            "boomLengthsCm": [
              165
            ],
            "battenCount": 5,
            "camCount": 0
          }
        ],
        pictures: []
      }

      expect(() => merger.merge(productOne as Product<SizeAndConstruction>, productTwo as Product<SizeAndConstruction>)).toThrow();
    })
  });
});
