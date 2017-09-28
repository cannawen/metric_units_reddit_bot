const should = require('chai').should();

const converter = require('../src/converter');

function testConvert(input, expectedMap) {
  if (Array.isArray(input)) {
    input = " " + input.join("  ") + " ";
  }
  comment = {
    'body' : input,
    'subreddit' : 'foo',
    'postTitle' : 'bar'
  }
  converter.conversions(comment).should.deep.equal(expectedMap);
}

function shouldNotConvert(numArr, units) {
  const numUnitArr = numArr.map(num => num + units);
  testConvert(numUnitArr, {})
}

describe('Converter', () => {
  describe('#conversions()', () => {
    context('lbs', () => {
      it('should convert', () => {
        testConvert(
          [
            "1001 lb"
          ],
          {
            "1,001 lb" : "450 kg"
          }
        );
      });

      context('and oz', () => {
        it('should convert', () => {
          testConvert(
            [
              "1lb4oz",
              "2-pound 7-ounces"
            ],
            {
              "1 lb 4 oz": "566.99 g",
              "2 lb 7 oz": "1.11 kg"
            }
          );
        });

        it('should not convert over 16 oz', () => {
          testConvert("I am 20 lb 200 oz", { });
        });
      });
    });

    context('fl oz', () => {
      it('should convert', () => {
        testConvert(
          [
            "10 fl oz",
            "1001 oz. liquid"
          ],
          {
            "10 fl. oz." : "300 mL",
            "1,001 fl. oz." : "30 L"
          }
        );
      });
    });

    context('oz', () => {
      it('should convert', () => {
        testConvert(
          [
            "10 oz",
            "1001 oz"
          ],
          {
            "10 oz" : "280 g",
            "1,001 oz" : "28 kg"
          }
        );
      });
    });

    context('feet', () => {
      it('should convert', () => {
        testConvert(
            [
              "3 feet",
              "5 feet",
            ],
            {
              "3 feet" : "90 cm",
              "5 feet" : "1.5 metres"
            }
          );
      });

      context('and inches', () => {
        it('should convert', () => {
          testConvert(
            [
              "1'2\"",
              "13 foot 4 inches",
              "11'12\""
            ],
            {
             "1'2\"": "35.66 cm",
             "13'4\"": "4.06 metres",
             "12'0\"": "3.66 metres"
            }
          );
        });

        it('should not convert over 12 inches', () => {
          testConvert("I am 6'13\" tall", { });
        });
      });
    });

    context('foot-pounds', () => {
      it('should convert', () => {
        testConvert(
          [
            "5 foot-pounds"
          ],
          {
            "5 ft·lbf" : "6.8 Nm"
          }
        );
      });
    });

    context('yards', () => {
      it('should convert', () => {
        testConvert(
          [
            "1-yard",
            "5 yards"
          ],
          {
            "1 yards": "90 cm",
            "5 yards" : "4.6 metres"
          }
        );
      });
    });

    context('psi', () => {
      it('should convert', () => {
        testConvert(
          [
            "5 psi"
          ],
          {
            "5 psi" : "34 kPa"
          }
        );
      });
    });

    context('inches', () => {
      it('should convert', () => {
        testConvert(
          [
            "1.1-inch"
          ],
          {
            "1.1 inches" : "2.8 cm"
          }
        );
      });
    });

    context('furlongs', () => {
      it('should convert', () => {
        testConvert(
          [
            "2-furlongs",
            "13-furlongs"
          ],
          {
            "2 furlongs": "400 metres",
            "13 furlongs" : "2.6 km"
          }
        );
      });
    });

    context('miles', () => {
      it('should convert', () => {
        testConvert(
          [
            "40miles"
          ],
          {
            "40 miles" : "64 km"
          }
        );
      });
    });

    context('mph', () => {
      it('should convert', () => {
        testConvert(
          [
            "40mph"
          ],
          {
            "40 mph" : "64 km/h"
          }
        );
      });
    });

    context('mpg', () => {
      it('should convert', () => {
        testConvert(
          [
            "25mpg"
          ],
          {
            "25 mpg (US)" : "10.6 km/L or 9.4 L/100km"
          }
        );
      });
    });

    context('teaspoons', () => {
      it('should convert', () => {
        testConvert(["25 teaspoons"], {"25 tsp" : "120 mL"});
      });
    });

    context('tablespoons', () => {
      it('should convert', () => {
        testConvert(["25 tablespoons"], {"25 Tbsp" : "370 mL"});
      });
    });

    context('cups', () => {
      it('should convert', () => {
        testConvert(["25 cups"], {"25 cups" : "6 L"});
      });
    });

    context('pints', () => {
      it('should convert', () => {
        testConvert(["25 pints"], {"25 pints" : "12 L"});
      });
    });

    context('quarts', () => {
      it('should convert', () => {
        testConvert(["25 quarts"], {"25 quarts" : "24 L"});
      });
    });

    context('gallons', () => {
      it('should convert', () => {
        testConvert(["25 gallons"], {"25 gal (US)" : "95 L"});
      });
    });

    context('imperial gallons', () => {
      it('should convert', () => {
        testConvert(
          [
            "25 imperial gallons"
          ],
          {
            "25 gal (imp)" : "114 L"
          }
        );
      });
    });

    context('°F', () => {
      it('should convert', () => {
        testConvert(
          [
            "32 °F"
          ],
          {
            "32°F" : "0°C"
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
           "40°F" : "4.4°C",
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
           "40°F" : "4.4°C",
           "50°F" : "10°C",
           "60°F" : "16°C",
           "70°F" : "21°C",
           "80°F" : "27°C"
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

        testConvert(inputString, { });
      });
    });

    context('comment already contains conversion', () => {
      it('should not convert', () => {
        testConvert("About 200 miles (320 km) away", {});
        testConvert("About 200 miles or some kilometers away", {});
        testConvert("About 200 degrees F or 100°C", {});
      });
    });

    context.skip('Current failing tests - bugs and edge cases', () => {
      //Story #150482058
      it('should display partial inches', () => {
        testConvert("9 feet 10.5", { "9'10.5\"": "3.01 metres" });
      });
    });
  });
});