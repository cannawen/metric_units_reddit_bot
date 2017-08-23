const should = require('chai').should();

const converter = require('../src/converter');

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
    context('feet', () => {
      it('should convert', () => {
        testConvert(
            [
              "101-feet",
              "20 feet",
              "3 foot",
              "400 feet",
              "5.5-ft"
            ],
            {
              "101 ft" : "30.8 metres",
              "20 ft" : "6.1 metres",
              "3 ft" : "0.9 metres",
              "400 ft" : "122 metres",
              "5'6\"" : "1.7 metres"
            }
          );
      });


      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "feet");
      });

      it('should not convert common values', () => {
        shouldNotConvert([1, 2, 4, 6], "feet");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "feet");
      });

      it('should not convert ft or \"', () => {
        shouldNotConvert([3], " ft");
        shouldNotConvert([3], "\"");
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
              "11'12\"",
              "13ft1",
              "400'0"
            ],
            {
	           "1'2\"": "0.36 metres",
	           "3'4\"": "1.01 metres",
             "5'6\"": "1.68 metres",
             "7'8\"": "2.34 metres",
             "9'11\"": "3.01 metres",
             "12 ft": "3.66 metres",
             "13'1\"": "3.99 metres",
             "400 ft" : "121.92 metres"
            }
          );
        });

        it('should not convert over 12 inches', () => {
          converter.conversions("I am 6'13\" tall").should.deep.equal({ });
        });
      });
    });

    context('inches', () => {
      it('should convert', () => {
        testConvert(
          [
            "1.1-in",
            "2inch",
            "3 inch",
            "40-inch",
            "50 inches"
          ],
          {
           "1.1 inches" : "2.8 cm",
           "2 inches" : "5.1 cm",
           "3 inches" : "7.6 cm",
           "40 inches" : "102 cm",
           "50 inches" : "127 cm"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "inches");
      });

      it('should not convert 1 inch', () => {
        shouldNotConvert([1], "inches");
      });

      it('should not convert in or \'', () => {
        shouldNotConvert([3], " in");
        shouldNotConvert([3], "\'");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "inches");
      });
    });

    context('miles', () => {
      it('should convert', () => {
        testConvert(
          [
            "4miles",
            "50 miles",
            "60 mi",
            "70 mile",
            "80-mile"
          ],
          {
           "4 miles" : "6.4 km",
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

      it('should not convert 1 mile or 8 miles', () => {
        shouldNotConvert([1, 8], "mile");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "miles");
      });
    });

    context('mph', () => {
      it('should convert', () => {
        testConvert(
          [
            "4mph",
            "50 mph",
            "60 miles per hour",
            "70 miles an hour"
          ],
          {
           "4 mph" : "6.4 km/h",
           "50 mph" : "80 km/h",
           "60 mph" : "97 km/h",
           "70 mph" : "113 km/h"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "mph");
      });

      it('should not convert 1 mph', () => {
        shouldNotConvert([1], "mph");
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

      it('should not convert less than 10 mpg, since it is likely a delta', () => {
        shouldNotConvert([1, 5, 9.99], "mpg");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "mph");
      });

      it('should flip the range conversion', () => {
        converter.conversions("30-40 mpg").should.deep.equal({ "30 to 40 mpg (US)": "5.9 to 7.8 L/100km"});
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
            "10000 degrees f"
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
            "(-50°F)",
            "~-40°F",
            ">0°F",
            "<32°F",
            "\n40°F"
          ],
          {
           "-50°F" : "-46°C",
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
           "0.45 miles" : "0.72 km",
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
            "1000.4 miles"
          ],
          {
           "999,123,456 miles" : "1,607,933,339 km",
           "1,000.4 miles" : "1,610.0 km"
          }
        );
      });
    });

    context('range', () => {
      it('should convert', () => {
        testConvert(
          [
            "0 to -40°F",
            "5000-9000 miles"
          ],
          {
            "0 to -40°F": "-18 to -40°C",
            "5,000 to 9,000 miles" : "8,047 to 14,484 km"
          }
        );
      });

      it('should collapse ranges if needed', () => {
        testConvert("100-101 degrees F", { "100 to 101°F" : "38°C" });
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

    context('should not convert if conversion is already calculated', () => {
      it('should not convert a value that has been converted', () => {
        testConvert(
          [
            "101°F",
            "101-200°F"
          ],
          {
            "101 to 200°F" : "38 to 93°C"
          }
        );
      });

      it('converts ranges but not single of the same units, if it is the last one', () => {
        testConvert(
          [
            "200°F",
            "101-200°F"
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
            "101-200°F"
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

    context('comment already contains conversion', () => {
      it('should not convert if the value is present', () => {
        converter.conversions("About 200 miles (322 km) away").should.deep.equal({});
        converter.conversions("About 200 miles or 322 kilometers away").should.deep.equal({});
        converter.conversions("About 200 miles or 322 away").should.deep.equal({});
      });
    });

    context.skip('Current failing tests - bugs and edge cases', () => {
      //Story #150482058
      it('should display partial inches', () => {
        converter.conversions("9 feet 10.5").should.deep.equal({ "9'10.5\"": "3.01 metres" });
      });

      // Story #150138193
      context('comment already contains conversion', () => {
        it('should not convert regardless of commas', () => {
          converter.conversions("About 2000 miles or 3219 kilometers away").should.deep.equal({});
        });

        it('should be smart enough to handle rounding', () => {
          converter.conversions("About 2000 miles or 3,220 kilometers away").should.deep.equal({});
        });

        it('should convert if the units do not match', () => {
          converter.conversions("About 200 miles and 322 degrees C away").should.deep.equal({"200 miles" : "322 km"});
        });

        it('should convert if the value does not exactly match', () => {
          converter.conversions("About 200 miles and 32222 km  away").should.deep.equal({"200 miles" : "322 km"});
        });
      });

    });

  });
});