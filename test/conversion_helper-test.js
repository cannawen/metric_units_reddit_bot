const should = require('chai').should();

const ch = require('../src/conversion_helper');

describe('conversion_helper', () => {
  describe('findPotentialConversions', () => {

    context('lbs', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1lb",
            "2lbs",
            "3 lb",
            "4 lbs",
            "5-lb",
            "6-lbs"
          ],
          [1, 2, 3, 4, 5, 6],
          " lb"
        );
      });

      context('when confident about one conversion', () => {
        it('should convert those with less confidence', () => {
          verifyPotentialConversions(
            [
              "1lb",
              // Less confident:
              "2pound",
              "3pounds",
              "4 pound",
              "5 pounds",
              "6-pound",
              "7-pounds"
            ],
            [1, 2, 3, 4, 5, 6, 7],
            " lb"
          );
        }); 
      });
    });

    context('feet', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1feet",
            "2foot",
            "3 feet",
            "4 foot",
            "5-ft",
            "6-feet",
            "7-foot"
          ],
          [1, 2, 3, 4, 5, 6, 7],
          " feet"
        );
      });

      context('when confident about one conversion', () => {
        it('should convert those with less confidence', () => {
          verifyPotentialConversions(
            [
              "1feet",
              "2'",
              "3ft"
            ],
            [1, 2, 3],
            " feet"
          );
        }); 
      });

      context('and inches', () => {
        it('should find conversions', () => {
          verifyPotentialConversions(
            [
              "1'2\"",
              "3 foot 4 inches",
              "5ft6in",
              "7-feet-8-in",
              "9' 10.5\"",
              "11'12\"",
              "4,000'0\"" //TODO make this its own test
            ],
            ["1.17", "3.33", "5.50", "7.67", "9.88", "12.00", "4000.00"],
            " feet"
          );
        });

        it('should not convert values that are not feet and inches', () => {
          verifyPotentialConversions(["12'000", "2004-'05"], undefined, undefined);
        });
      });
    });

    context('inches', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1inch",
            "2inches",
            "3 inch",
            "4 inches",
            "5-in",
            "6-inch"
          ],
          [1, 2, 3, 4, 5, 6],
          " inches"
        );
      });

      context('when confident about one conversion', () => {
        it('should convert those with less confidence', () => {
          verifyPotentialConversions(
            [
              "1inch",
              "2\""
            ],
            [1, 2],
            " inches"
          );
        }); 
      });
    });

    context('miles', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1mi",
            "2mile",
            "3miles",
            "4 mi",
            "5 mile",
            "6 miles",
            "7-mi",
            "8-mile",
            "9-miles"
          ],
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          " miles"
        );
      });
    });

    context('mph', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1mph",
            "2miles per hour",
            "3miles an hour",
            "4 mph",
            "5 miles per hour",
            "6 miles an hour",
            "7-mph"
          ],
          [1, 2, 3, 4, 5, 6, 7],
          " mph"
        );
      });
    });

    context('mpg', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1mpg",
            "2miles per gal",
            "3miles per gallon",
            "4 mpg",
            "5 miles per gal",
            "6 miles per gallon",
            "7-mpg"
          ],
          [1, 2, 3, 4, 5, 6, 7],
          " mpg (US)"
        );
      });
    });

    context('°F', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1°f",
            "2°fahrenheit",
            "3degree fahrenheit",
            "4degree f",
            "5degrees fahrenheit",
            "6degrees f",
            "7fahrenheit",
            "8 °f",
            "9 °fahrenheit",
            "10 degree fahrenheit",
            "11 degree f",
            "12 degrees fahrenheit",
            "13 degrees f",
            "14 fahrenheit",
            "15-degree fahrenheit",
            "16-degree f",
            "17-degrees fahrenheit",
            "18-degrees f",
            "19-fahrenheit"
          ],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
          "°F"
        );
      });


      context('when confident about one conversion', () => {
        it('should convert those with less confidence', () => {
          verifyPotentialConversions(
            [
              "1°f",
              "2F",
              "3degree",
              "4degrees",
              "5 F",
              "6 degree",
              "7 degrees",
              "8-degree",
              "9-degrees"
            ],
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            "°F"
          );
        }); 
      });
    });

    context('units should be found case-insensitively', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1°F",
            "2°f"
          ],
          [1, 2],
          "°F"
        );
      });
    });

    context('negative numbers should be found', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          "-1°f",
          [-1],
          "°F"
        );
      });
    });

    context('numbers with commas should be found', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1,000°f",
            "1,000,000°f"
          ],
          [1000, 1000000],
          "°F"
        );
      });
    });

    context('decimal numbers should be found', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1.1°f",
            "-2.22°f",
            "3,333.333°f",
            "-44,444.4444°f"
          ],
          [1.1, -2.22, 3333.333, -44444.4444],
          "°F"
        );
      });
    });

    context('ranges', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1-2°f",
            "-3 to -4°f"
          ],
          [1, 2, -3, -4],
          "°F"
        );
      });
    });

  });
});

function verifyPotentialConversions(input, numbers, unit) {
  if (Array.isArray(input)) {
    input = " " + input.join("  ") + " ";
  }
  let expectedOutput = [];
  if (Array.isArray(numbers)) {
    expectedOutput = numbers.reduce((memo, el) => {
      let inputNumber;
      let inputUnit;

      if (Array.isArray(el)) {
        inputNumber = el[0];
        inputUnit = el[1];
      } else {
        inputNumber = el.toString();
        inputUnit = unit;
      }

      memo.push({
        "inputNumber" : inputNumber,
        "inputUnit" : inputUnit
      });

      return memo;
    }, expectedOutput);
  }

  ch.findPotentialConversions(input).should.deep.equal(expectedOutput);
}