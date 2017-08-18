const should = require('chai').should();

const converter = require('../src/converter');

function testConvertTrue(entireInput, expectedConversion, inputConversion) {
  if (inputConversion === undefined) {
    inputConversion = entireInput;
  }

  var expected = {};
  expected[inputConversion] = expectedConversion;

  const actual = converter.conversions(entireInput);
  actual.should.deep.equal(expected);
}

function testConvertFalse(input) {
  converter.conversions(input).should.deep.equal({});
}

function testConvert(input, expectedMap) {
  if (Array.isArray(input)) {
    input = " " + input.join("  ") + " ";
  }
  converter.conversions(input).should.deep.equal(expectedMap);
}

function shouldNotConvert(numArr, units) {
  const numUnitArr = numArr.map(num => num + units);
  testConvert(numUnitArr, {})
}

describe('Converter', () => {
  describe('#conversions()', () => {

    context('Current failing tests - bugs and edge cases', () => {
      // Story #150197623
      it.skip('should collapse ranges if needed', () => {
        testConvert("100-101 degrees F ", { "100 to 101°F" : "38°C" });
      });

      // Story #150335050
      it.skip('should convert parenthesized measurements', () => {
        testConvert("It's cold (-40°F) outside", { "-40°F" : "-40°C" });
      });
    });

    context('feet', () => {
      it('should convert', () => {
        testConvert(
            [
              "1-feet",
              "2 feet",
              "3 foot",
              "4 ft",
              "5'"
            ],
            {
              "1 foot" : "0.3 meters",
              "2 feet" : "0.6 meters",
              "3 feet" : "0.9 meters",
              "4 feet" : "1.2 meters",
              "5 feet" : "1.5 meters",
            }
          );
      });

      context('and inches', () => {
        it('should convert', () => {
          testConvert(
            [
              "1'2\"",
              "3 foot 4 inches",
              "5ft6in",
              "7-feet-8-in",
              "9' 10.5\"",
              "11'12\""
            ],
            {
             "1.2 feet" : "0.4 meters",
             "3.3 feet" : "1.0 meter",
             "5.5 feet" : "1.7 meters",
             "7.7 feet" : "2.3 meters",
             "9.9 feet" : "3.0 meters",
             "12.0 feet" : "3.7 meters"
            }
          );
        });
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "feet");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "feet");
      });
    });

    context('inches', () => {
      it('should convert', () => {
        testConvert(
          [
            "1in",
            "2-in",
            "3 inch",
            "4-inch",
            "5 inches",
            "6\""
          ],
          {
           "1 inch" : "2.5 cm",
           "2 inches" : "5.1 cm",
           "3 inches" : "7.6 cm",
           "4 inches" : "10 cm",
           "5 inches" : "13 cm",
           "6 inches" : "15 cm"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "inches");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "inches");
      });
    });

    context('miles', () => {
      it('should convert', () => {
        testConvert(
          [
            "40miles",
            "50 miles",
            "60 mi",
            "70 mile",
            "80-mile"
          ],
          {
           "40 miles" : "64 km",
           "50 miles" : "80 km",
           "60 miles" : "97 km",
           "70 miles" : "113 km",
           "80 miles" : "129 km"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "miles");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "miles");
      });
    });

    context('mph', () => {
      it('should convert', () => {
        testConvert(
          [
            "40mph",
            "50 mph",
            "60 miles per hour",
            "70 miles an hour"
          ],
          {
           "40 mph" : "64 km/h",
           "50 mph" : "80 km/h",
           "60 mph" : "97 km/h",
           "70 mph" : "113 km/h"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "mph");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "mph");
      });
    });

    context('mpg', () => {
      it('should convert', () => {
        testConvert(
          [
            "20 mpg",
            "30mpg",
            "50 miles per gallon"
          ],
          {
           "20 mpg (US)" : "12 L/100km",
           "30 mpg (US)" : "7.8 L/100km",
           "50 mpg (US)" : "4.7 L/100km"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "mpg");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "mph");
      });
    });

    context('°F', () => {
      it('should convert', () => {
        testConvert(
          [
            "-40°f",
            "0°F",
            "32 °F",
            "40 ° F",
            "50 Fahrenheit",
            "60 fahrenheit",
            "70 degree fahrenheit",
            "80 degrees fahrenheit",
            "90 degree f",
            "10000 degrees f",            
          ],
          {
           "-40°F" : "-40°C",
           "0°F" : "-18°C",
           "32°F" : "0°C",
           "40°F" : "4°C",
           "50°F" : "10°C",
           "60°F" : "16°C",
           "70°F" : "21°C",
           "80°F" : "27°C",
           "90°F" : "32°C",
           "10,000°F" : "5,538°C"
         }
        );
      });
    });

    context('supported special characters', () => {
      it('should convert when starting with special characters', () => {
        testConvert(
          [
            "~-40°F",
            ">0°F",
            "<32°F",
            "\n40°F"
          ],
          {
           "-40°F" : "-40°C",
           "0°F" : "-18°C",
           "32°F" : "0°C",
           "40°F" : "4°C"
         }
        );
      });

      it('should convert when ending with special characters', () => {
        testConvert(
          [
            "-40°F.",
            "0°F,",
            "32°F;",
            "40°F?",
            "50°F!",
            "60°F:",
            "70°F\n"
          ],
          {
           "-40°F" : "-40°C",
           "0°F" : "-18°C",
           "32°F" : "0°C",
           "40°F" : "4°C",
           "50°F" : "10°C",
           "60°F" : "16°C",
           "70°F" : "21°C"
         }
        );
      });
    });

    context('decimal numbers', () => {
      it('should convert with the same precision', () => {
        testConvert(
          [
            "0.2 miles",
            ".45 miles",
            "6.789 miles"
          ],
          {
           "0.2 miles" : "0.3 km",
           ".45 miles" : "0.72 km",
           "6.789 miles" : "10.926 km"
          }
        );
      });
    });

    context('large numbers', () => {
      it('should convert with commas', () => {
        testConvert(
          [
            "999,123,456 miles",
            "1000.4 miles",
          ],
          {
           "999,123,456 miles" : "1,607,933,339 km",
           "1,000.4 miles" : "1,610.0 km",
          }
        );
      });
    });

    context('range', () => {
      it('should convert', () => {
        testConvert(
          [
            "30-40 mpg",
            "0 to -40°F",
          ],
          {
            "30 to 40 mpg (US)": "7.8 to 5.9 L/100km",
            "0 to -40°F": "-18 to -40°C"
          }
        );
      });
    });

    context('nothing to convert', () => {
      it('should not convert', () => {
        const inputString = [
          "some miles",
          "50",
          "90km",
          "1,10,2 miles",
          "a22°Fb",
          "a 22°Fb",
          "a22°F b",
          "a22°Fb",
          "22F"
        ].join("  ");

        converter.conversions(inputString).should.deep.equal({ });
      });
    });

    context('interesting cases', () => {
      it('converts ranges and singles of the same units, if it is the first one', () => {
        testConvert(
          [
            "101°F",
            "101-200°F",
          ],
          {
            "101 to 200°F" : "38 to 93°C", 
            "101°F" : "38°C"
          }
        );
      });

      it('converts ranges but not single of the same units, if it is the last one', () => {
        testConvert(
          [
            "200°F",
            "101-200°F",
          ],
          {
            "101 to 200°F" : "38 to 93°C"
          }
        );
      });

      it('converts ranges but not single of the same units, if it is the last one', () => {
        testConvert(
          [
            "200 miles",
            "101-200°F",
          ],
          {
            "101 to 200°F" : "38 to 93°C",
            "200 miles" : "322 km"
          }
        );
      });

      it('should resolve all equivalent conversions to one outcome', () => {
        testConvert(
          [
            "200 miles",
            "200mi",
          ],
          {
            "200 miles" : "322 km"
          }
        );
      });
    });
  });
});
