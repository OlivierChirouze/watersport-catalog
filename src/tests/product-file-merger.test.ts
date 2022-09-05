import {ProductMerger} from "../object-merger";
import {BoardType, FinFamily, Product, ProductType, Program, WindsurfFinBoxType} from "../index";

type Type = {
    "construction": string,
    "size": number
};
describe("product-file-merger", () => {
    test("merge", () => {
        const productA: Product<Type> = {
            brandName: "",
            description: {},
            dimensions: [],
            name: "",
            pictures: [],
            programs: [],
            subType: undefined,
            type: undefined,
            variants: [],
            year: 0
        }
        const productB: Product<Type> = {
            "dimensions": [
                "size",
                "construction"
            ],
            "brandName": "JP Australia",
            "year": 2017,
            "name": "Super Sport",
            "type": ProductType.board,
            "subType": BoardType.windsurfBoard,
            "programs": [
                Program.race,
            ],
            "variants": [
                {
                    "variant": {
                        "size": 125,
                        "construction": "Gold"
                    },
                    "lengthCm": 237,
                    "widthCm": 76,
                    "volumeL": 125,
                    "weightKg": 6.6,
                    "fins": [
                        {
                            "count": 1,
                            "type": WindsurfFinBoxType.TuttleBox
                        }
                    ],
                    "compatibleFinFamilies": [
                        FinFamily.fins
                    ]
                },
                {
                    "variant": {
                        "size": 101,
                        "construction": "Pro"
                    },
                    "lengthCm": 237,
                    "widthCm": 64,
                    "volumeL": 101,
                    "weightKg": 6.5,
                    "fins": [
                        {
                            "count": 1,
                            "type": WindsurfFinBoxType.TuttleBox
                        }
                    ],
                    "compatibleFinFamilies": [
                        FinFamily.fins
                    ]
                },
                {
                    "variant": {
                        "size": 113,
                        "construction": "Pro"
                    },
                    "lengthCm": 237,
                    "widthCm": 70,
                    "volumeL": 113,
                    "weightKg": 7,
                    "fins": [
                        {
                            "count": 1,
                            "type": WindsurfFinBoxType.TuttleBox
                        }
                    ],
                    "compatibleFinFamilies": [
                        FinFamily.fins
                    ]
                },
                {
                    "variant": {
                        "size": 125,
                        "construction": "Pro"
                    },
                    "lengthCm": 237,
                    "widthCm": 76,
                    "volumeL": 125,
                    "weightKg": 7.5,
                    "fins": [
                        {
                            "count": 1,
                            "type": WindsurfFinBoxType.TuttleBox
                        }
                    ],
                    "compatibleFinFamilies": [
                        FinFamily.fins
                    ]
                },
                {
                    "variant": {
                        "size": 137,
                        "construction": "Pro"
                    },
                    "lengthCm": 237,
                    "widthCm": 82,
                    "volumeL": 137,
                    "weightKg": 7.9,
                    "fins": [
                        {
                            "count": 1,
                            "type": WindsurfFinBoxType.TuttleBox
                        }
                    ],
                    "compatibleFinFamilies": [
                        FinFamily.fins
                    ]
                }
            ],
            "description": {},
            pictures: []
        }

        const merger = new ProductMerger<Type>();

        const merged = merger.merge(productA, productB);

        console.log(merged)
    })
})
