const should = require('chai').should();

const converter = require('../src/converter');

function testConvert(input, expectedMap) {
  if (Array.isArray(input)) {
    input = " " + input.join("  ") + " ";
  }
  converter.conversions(input, "foobar").should.deep.equal(expectedMap);
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
              "40feet",
              "5.5-ft"
            ],
            {
              "101 ft" : "30.8 metres",
              "20 ft" : "6.1 metres",
              "3 ft" : "0.9 metres",
              "40 ft" : "12.2 metres",
              "5'6\"" : "1.7 metres"
            }
          );
      });

      it('should switch precision appropriately', () => {
        testConvert(
          [
            "327 feet",
            "328 feet",
            "329 feet"
          ],
          { 
            "327 ft" : "99.7 metres",
            "328 ft" : "100.0 metres",
            "329 ft" : "100 metres",
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
          testConvert("I am 6'13\" tall", { });
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

      it('should switch precision appropriately', () => {
        testConvert(
          [
            "39 inch",
            "40 inch"
          ],
          { 
            "39 inches" : "99.1 cm",
            "40 inches" : "102 cm"
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

      it('should not convert penis measurements in comments', () => {
        testConvert("I have a 10-inch DONG", {});
      });

      it('should not convert screen sizes in comments', () => {
        testConvert("My 32 inch ultra widescreen monitor", {});
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

      it('should switch precision appropriately', () => {
        testConvert(
          [
            "6 miles",
            "7 miles"
          ],
          { 
            "6 miles" : "9.7 km",
            "7 miles" : "11 km"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "miles");
      });

      it('should not convert 1, 8, or 10 miles', () => {
        shouldNotConvert([1, 8, 10], "mile");
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

      it('should switch precision appropriately', () => {
        testConvert(
          [
            "6 mph",
            "7 mph"
          ],
          { 
            "6 mph" : "9.7 km/h",
            "7 mph" : "11 km/h"
          }
        );
      });

      it('should not convert zero or negative values', () => {
        shouldNotConvert([0, -10], "mph");
      });

      it('should not convert 1 or 10 mph', () => {
        shouldNotConvert([1, 10], "mph");
      });

      it('should not convert when values are likely hyperbole', () => {
        shouldNotConvert([100, 1000, 10000], "mph");
      });
    });

    context('mpg', () => {
      it('should convert', () => {
        testConvert(
          [
            "25 mpg",
            "30mpg",
            "50 miles per gallon"
          ],
          {
           "25 mpg (US)" : "9.4 L/100km",
           "30 mpg (US)" : "7.8 L/100km",
           "50 mpg (US)" : "4.7 L/100km"
          }
        );
      });

      it('should switch precision appropriately', () => {
        testConvert(
          [
            "23 mpg",
            "24 mpg"
          ],
          { 
            "23 mpg (US)" : "10 L/100km",
            "24 mpg (US)" : "9.8 L/100km"
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

      it('should not convert in sports subs', () => {
        converter.conversions("He played 30mpg", "basketball4lyfe").should.deep.equal({});
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
            "(-50°F",
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
            "-50°F)",
            "-40°F.",
            "0°F,",
            "32°F;",
            "40°F?",
            "50°F!",
            "60°F:",
            "70°F\n",
            "80°F/"
          ],
          {
           "-50°F" : "-46°C",
           "-40°F" : "-40°C",
           "0°F" : "-18°C",
           "32°F" : "0°C",
           "40°F" : "4°C",
           "50°F" : "10°C",
           "60°F" : "16°C",
           "70°F" : "21°C",
           "80°F" : "27°C"
         }
        );
      });

      context('should convert ranges', () => {
        it('starting with special characters', () => {
          testConvert(
            [
              "(-50 to 32°F",
              "~-40 to 32°F",
              ">0 to 32°F",
              "<32 to 0°F",
              "\n40 to 32°F"
            ],
            {
             "-50 to 32°F" : "-46 to 0°C",
             "-40 to 32°F" : "-40 to 0°C",
             "0 to 32°F" : "-18 to 0°C",
             "32 to 0°F" : "0 to -18°C",
             "40 to 32°F" : "4 to 0°C"
           }
          );
        });

        it('ending with special characters', () => {
          testConvert(
            [
              "32 to -50°F)",
              "32 to -40°F.",
              "32 to 0°F,",
              "0 to 32°F;",
              "32 to 40°F?",
              "32 to 50°F!",
              "32 to 60°F:",
              "32 to 70°F\n",
              "32 to 80°F/"
            ],
            {
             "32 to -50°F" : "0 to -46°C",
             "32 to -40°F" : "0 to -40°C",
             "32 to 0°F" : "0 to -18°C",
             "0 to 32°F" : "-18 to 0°C",
             "32 to 40°F" : "0 to 4°C",
             "32 to 50°F" : "0 to 10°C",
             "32 to 60°F" : "0 to 16°C",
             "32 to 70°F" : "0 to 21°C",
             "32 to 80°F" : "0 to 27°C"
           }
          );
        });
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
            "0 - -40°F",
            "5000-9000 miles",
            "30 TO 40 mpg"
          ],
          {
            "0 to -40°F": "-18 to -40°C",
            "5,000 to 9,000 miles" : "8,047 to 14,484 km",
            "30 to 40 mpg (US)": "7.8 to 5.9 L/100km"
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

        testConvert(inputString, { });
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
        testConvert("About 200 miles (322 km) away", {});
        testConvert("About 200 miles or 322 kilometers away", {});
        testConvert("About 200 miles or 322 away", {});
      });
    });

    context.skip('Current failing tests - bugs and edge cases', () => {
      //Story #150482058
      it('should display partial inches', () => {
        testConvert("9 feet 10.5", { "9'10.5\"": "3.01 metres" });
      });

      // Story #150138193
      context('comment already contains conversion', () => {
        it('should not convert regardless of commas', () => {
          testConvert("About 2000 miles or 3219 kilometers away", {});
        });

        it('should be smart enough to handle rounding', () => {
          testConvert("About 2000 miles or 3,220 kilometers away", {});
        });

        it('should convert if the units do not match', () => {
          testConvert("About 200 miles and 322 degrees C away", {"200 miles" : "322 km"});
        });

        it('should convert if the value does not exactly match', () => {
          testConvert("About 200 miles and 32222 km  away", {"200 miles" : "322 km"});
        });
      });

    });

  });
});