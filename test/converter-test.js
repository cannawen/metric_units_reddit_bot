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
            "1 lb"
          ],
          {
            "1 lb" : "0.45 kg"
          }
        );
      });
    });

    context('feet', () => {
      it('should convert', () => {
        testConvert(
            [
              "3 feet"
            ],
            {
              "3 feet" : "0.9 metres",
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
             "1'2\"": "0.36 metres",
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

    context('inches', () => {
      it('should convert', () => {
        testConvert(
          [
            "1.1-in"
          ],
          {
           "1.1 inches" : "2.8 cm"
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
           "25 mpg (US)" : "9.4 L/100km"
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
           "40°F" : "4.4°C"
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

    context('comment contains quote', () => {
      it('should not convert', () => {
        testConvert("> About 201 miles away", {});
        testConvert(">1.5lbs", {});
        testConvert("\n&gt; About 202 miles away", {});
      });
    });

    context('comment already contains conversion', () => {
      it('should not convert', () => {
        testConvert("About 200 miles (320 km) away", {});
        testConvert("About 200 miles or 300 kilometers away", {});
        testConvert("About 200 miles or 322 km away", {});
      });
    });

    context('ignored keywords', () => {
      it('should not convert if the sub name matches exclusion', () => {
        const comment = {
          'body' : 'He played 30mpg',
          'subreddit' : 'basketball4lyfe',
          'postTitle' : 'bar'
        }
        converter.conversions(comment).should.deep.equal({});
      });
      
      it('should not convert if the post title matches exclusion', () => {
        const comment = {
          'body' : 'He played 30mpg',
          'subreddit' : 'foo',
          'postTitle' : 'this is basketball talk'
        }
        converter.conversions(comment).should.deep.equal({});
      });
      
      it('should not convert if the body matches, case-insensitive', () => {
        testConvert("My 32 inch ultra widescreen MONITOR", {});
      });

      it('should not convert if keyword is not found', () => {
        testConvert("10 inches of grassy hills", {"10 inches" : "25 cm"})
      });
    })

    context.skip('Current failing tests - bugs and edge cases', () => {
      //Story #150482058
      it('should display partial inches', () => {
        testConvert("9 feet 10.5", { "9'10.5\"": "3.01 metres" });
      });
    });
  });
});