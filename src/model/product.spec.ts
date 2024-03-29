import { getClosestVariant } from "./product";

describe("getClosestVariant", () => {
  const list = [
    { variant: { size: 12, dimension: "test" } },
    { variant: { size: 13, dimension: "test" }, anything: "else" }
  ];

  it("should find exact match if exists", () => {
    expect(getClosestVariant({ size: 13, dimension: "test" }, list)).toEqual({
      variant: { size: 13, dimension: "test" },
      anything: "else"
    });

    expect(
      getClosestVariant({ size: 13, dimension: "different" }, list)
    ).toEqual(undefined);
  });

  it("should find more general match", () => {
    // There is no match with color:12 but there's a more general entry
    expect(
      getClosestVariant({ size: 12, dimension: "test", color: "12" }, list)
    ).toEqual({ variant: { size: 12, dimension: "test" } });

    expect(
      getClosestVariant(
        { size: 12, dimension: "test", color: "12", otherDimension: 12 },
        list
      )
    ).toEqual({ variant: { size: 12, dimension: "test" } });
  });

  it("should find string sizes", () => {

    const list2 = [
      {
        variant: {
          "size": "5’1",
          "construction": "Double bamboo Deck"
        }
      },
      {
        variant: {
          "size": "5’4",
          "construction": "Double bamboo Deck"
        }
      }
    ];

    expect(
      getClosestVariant(
        {
          "size": "5’1"
        },
        list2
      )
    ).toEqual({
      variant: {
        "size": "5’1",
        "construction": "Double bamboo Deck"
      }
    });
  });

});
