import {getClosestVariant} from "./product";

describe('getClosestVariant', () => {
  const list = [
    {variant: {size: 12, dimension: "test"}},
    {variant: {size: 13, dimension: "test"}, anything: "else"},
  ]

  it('should find exact match if exists', () => {
    expect(getClosestVariant({size: 13, dimension: "test"}, list)).toEqual(
      {variant: {size: 13, dimension: "test"}, anything: "else"}
    );

    expect(getClosestVariant({size: 13, dimension: "different"}, list)).toEqual(
      undefined
    );
  });

  it('should find more general match', () => {
    // There is no match with color:12 but there's a more general entry
    expect(
      getClosestVariant<{size: number, dimension: string, color: string}>({size: 12, dimension: "test", color: "12"}, list)
    ).toEqual({variant: {size: 12, dimension: "test"}});

    expect(
      getClosestVariant<{size: number, dimension: string, color: string, otherDimension: number}>({size: 12, dimension: "test", color: "12", otherDimension: 12}, list)
    ).toEqual({variant: {size: 12, dimension: "test"}});

    // However if there are only entries that are _more detailed_, it doesn't match
    expect(
      getClosestVariant<{size: number, dimension: string, color: string}>({size: 12, color:"14"}, list)
    ).toEqual(undefined);
  });

});
