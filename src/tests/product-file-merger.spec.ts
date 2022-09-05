import {BoardType, FinFamily, Product, ProductType, Program, WindsurfFinBoxType} from "../index";
import {ProductMerger} from "../merge/product-merger";

type Type = {
    "construction": string,
    "size": number
};
describe("product-file-merger", () => {
    let productA: Product<Type>;
    let productB: Product<Type>

    const merger = new ProductMerger<Type>();

    beforeEach(() => {
        productA = {
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
                        "construction": "Gold"
                    },
                    "lengthCm": 237,
                    "widthCm": 76,
                    "volumeL": 125,
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
    })

    describe("merge", () => {

        it('should merge empty', () => {

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
            }

            expect(merger.merge(productB, productA)).toEqual(productA);
            expect(merger.merge(productA, productB)).toEqual(productA);

        })

        it('should add variant and programs', () => {
            productB = {
                "dimensions": [],
                "brandName": "JP Australia",
                "year": 2017,
                "name": "Super Sport",
                "type": ProductType.board,
                "subType": BoardType.windsurfBoard,
                "programs": [
                    Program.freeride,
                ],
                "variants": [
                    {
                        "variant": {
                            "size": 125,
                            "construction": "other"
                        },
                        "lengthCm": 237,
                        "widthCm": 76,
                        "volumeL": 125,
                        "weightKg": 6.6,
                        "fins": [
                            {
                                "count": 2,
                                "type": WindsurfFinBoxType.TuttleBox
                            }
                        ],
                        "compatibleFinFamilies": [
                            FinFamily.fins
                        ]
                    }
                ],
                "description": {en: "this is my description"},
                pictures: []
            };

            let expected: Product<Type> = {
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
                    Program.freeride,
                    Program.race,
                ],
                "variants": [
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
                            "construction": "Gold"
                        },
                        "lengthCm": 237,
                        "widthCm": 76,
                        "volumeL": 125,
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
                            "construction": "other"
                        },
                        "lengthCm": 237,
                        "widthCm": 76,
                        "volumeL": 125,
                        "weightKg": 6.6,
                        "fins": [
                            {
                                "count": 2,
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
                "description": {en: "this is my description"},
                pictures: []
            }

            expect(merger.merge(productA, productB)).toEqual(expected);
            expect(merger.merge(productB, productA)).toEqual(expected);
        })

        it('should update variant', () => {
            productB = {
                "dimensions": [],
                "brandName": "JP Australia",
                "year": 2017,
                "name": "Super Sport",
                "type": ProductType.board,
                "subType": BoardType.windsurfBoard,
                "programs": [],
                "variants": [
                    {
                        "variant": {
                            "size": 125,
                            "construction": "Gold"
                        },
                        "weightKg": 6.6, // Notice weight is new
                        "volumeL": 125,
                        "fins": [],
                        "compatibleFinFamilies": []
                    },
                ],
                "description": {},
                pictures: []
            };

            let expected: Product<Type> = {
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
                            "construction": "Gold"
                        },
                        "lengthCm": 237,
                        "widthCm": 76,
                        "volumeL": 125,
                        "fins": [
                            {
                                "count": 1,
                                "type": WindsurfFinBoxType.TuttleBox
                            }
                        ],
                        "compatibleFinFamilies": [
                            FinFamily.fins
                        ],
                        "weightKg": 6.6, // Notice weight is new
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

            expect(merger.merge(productA, productB)).toEqual(expected);
            expect(merger.merge(productB, productA)).toEqual(expected);
            //
        })
    })
})
