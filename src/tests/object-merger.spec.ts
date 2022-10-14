import {
  BoardType,
  FinFamily,
  Product,
  ProductType,
  Program,
  FinBoxType
} from "../index";
import { ProductMerger } from "../merge/product-merger";
import { ObjectMerger, onlyUniqueObject } from "../merge/object-merger";

type Type = {
  construction: string;
  size: number;
};
describe("object-merger", () => {
  const merger = new ObjectMerger();

  describe("only unique", () => {
    const array = [
      {
        name: "Classic",
        year: 2019,
        url: "http://source-info.com/2019-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2020,
        url: "http://source-info.com/2020-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2021,
        url: "http://source-info.com/2021-sealion-classic"
      },
      {
        name: "Classic",
        year: 2022,
        url: "http://source-info.com/2022-sealion-classic"
      },
      {
        name: "Summer",
        year: 2019,
        url: "http://source-info.com/2019-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2020,
        url: "http://source-info.com/2020-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2021,
        url: "http://source-info.com/2021-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2022,
        url: "http://source-info.com/2022-sealion-summer",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2019,
        url: "http://source-info.com/2019-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2020,
        url: "http://source-info.com/2020-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Classic",
        year: 2019,
        url: "http://source-info.com/2019-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2020,
        url: "http://source-info.com/2020-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2021,
        url: "http://source-info.com/2021-sealion-classic"
      },
      {
        name: "Classic",
        year: 2022,
        url: "http://source-info.com/2022-sealion-classic"
      },
      {
        name: "Summer",
        year: 2019,
        url: "http://source-info.com/2019-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2020,
        url: "http://source-info.com/2020-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2021,
        url: "http://source-info.com/2021-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2022,
        url: "http://source-info.com/2022-sealion-summer",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2019,
        url: "http://source-info.com/2019-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2020,
        url: "http://source-info.com/2020-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Classic",
        year: 2019,
        url: "http://source-info.com/2019-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2020,
        url: "http://source-info.com/2020-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2021,
        url: "http://source-info.com/2021-sealion-classic"
      },
      {
        name: "Classic",
        year: 2022,
        url: "http://source-info.com/2022-sealion-classic"
      },
      {
        name: "Summer",
        year: 2019,
        url: "http://source-info.com/2019-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2020,
        url: "http://source-info.com/2020-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2021,
        url: "http://source-info.com/2021-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2022,
        url: "http://source-info.com/2022-sealion-summer",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2019,
        url: "http://source-info.com/2019-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2020,
        url: "http://source-info.com/2020-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      }
    ];

    expect(array.filter(onlyUniqueObject)).toEqual([
      {
        name: "Classic",
        year: 2019,
        url: "http://source-info.com/2019-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2020,
        url: "http://source-info.com/2020-sealion-classic",
        programs: ["freeride"],
        finFamilies: ["fins"]
      },
      {
        name: "Classic",
        year: 2021,
        url: "http://source-info.com/2021-sealion-classic"
      },
      {
        name: "Classic",
        year: 2022,
        url: "http://source-info.com/2022-sealion-classic"
      },
      {
        name: "Summer",
        year: 2019,
        url: "http://source-info.com/2019-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2020,
        url: "http://source-info.com/2020-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2021,
        url: "http://source-info.com/2021-sealion-summer",
        programs: ["beginner"],
        finFamilies: ["fins"]
      },
      {
        name: "Summer",
        year: 2022,
        url: "http://source-info.com/2022-sealion-summer",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2019,
        url: "http://source-info.com/2019-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      },
      {
        name: "Wings",
        year: 2020,
        url: "http://source-info.com/2020-sealion-wings",
        programs: ["foiling"],
        finFamilies: ["foil"]
      }
    ]);
  });

  describe("merge", () => {
    it("should remove duplicates", () => {
      expect(
        merger.merge(
          [
            {
              name: "Fast Foward",
              year: 2020,
              url: "http://source-info.com/2020-ahd-fast-foward",
              programs: ["freeride", "wave"],
              finFamilies: ["fins"]
            },
            {
              name: "Fast Foward",
              year: 2021,
              url: "http://source-info.com/2021-ahd-fast-foward",
              programs: ["freeride"],
              finFamilies: ["fins"]
            },
            {
              name: "Classic",
              year: 2019,
              url: "http://source-info.com/2019-sealion-classic",
              programs: ["freeride"],
              finFamilies: ["fins"]
            },

            {
              name: "Classic",
              year: 2019,
              url: "http://source-info.com/2019-sealion-classic",
              programs: ["freeride"],
              finFamilies: ["fins"]
            }
          ],
          [
            {
              name: "Fast Foward",
              year: 2020,
              url: "http://source-info.com/2020-ahd-fast-foward",
              programs: ["freeride", "wave"],
              finFamilies: ["fins"]
            },
            {
              name: "Fast Foward",
              year: 2021,
              url: "http://source-info.com/2021-ahd-fast-foward",
              programs: ["freeride"],
              finFamilies: ["fins"]
            },

            {
              name: "Classic",
              year: 2019,
              url: "http://source-info.com/2019-sealion-classic",
              programs: ["freeride"],
              finFamilies: ["fins"]
            }
          ]
        )
      ).toEqual([
        {
          name: "Fast Foward",
          year: 2020,
          url: "http://source-info.com/2020-ahd-fast-foward",
          programs: ["freeride", "wave"],
          finFamilies: ["fins"]
        },
        {
          name: "Fast Foward",
          year: 2021,
          url: "http://source-info.com/2021-ahd-fast-foward",
          programs: ["freeride"],
          finFamilies: ["fins"]
        },
        {
          name: "Classic",
          year: 2019,
          url: "http://source-info.com/2019-sealion-classic",
          programs: ["freeride"],
          finFamilies: ["fins"]
        }
      ]);
    });
  });
});
