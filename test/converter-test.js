const assert = require('assert');
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

describe('Converter', () => {
  describe('#conversions()', () => {

    context('Current failing tests - bugs and edge cases', () => {
      // it('should collapse ranges if needed', () => {
      //   converter.conversions("100-101 degrees F ").should.deep.equal({"100 to 101°F" : "38°C" })
      // })

      // it('should convert miles per hour', () => {
      //   testConvertTrue("999,123,456 miles per hour", "1,607,933,339 km/h");
      // });
    })

    context('Post that is very long (>300 chars)', () => {
      it('should not convert', () => {
        testConvertFalse("t the park, have you and your 5 miles kids make some silly faces for pictures on the Thunder Mountain and talk about how it would make great Christmas cards this year. Drink about 8 bud lights throughout the day but not really ever be buzzed. Go to Red Lobster that night for dinner even though there are other seafood options just because of the biscuits and eat at least 3 baskets worth");
      });
    });

    context('Posted by another bot', () => {
      it('should not convert', () => {
        testConvertFalse("90 degree F bot");
        testConvertFalse("5 miles beep boop, I am a bot!");
      });
    });    

    context('Has distance to convert', () => {
      it('should convert text with context', () => {
        testConvertTrue("I would walk 10001 miles bottom", "16,095 km", "10,001 miles");
        testConvertTrue("I would walk 10001mi", "16,095 km", "10,001 miles");
      });

      it('should convert miles and mph', () => {
        converter.conversions("50 miles 40mph 60psi").should.deep.equal({"50 miles":"80 km", "40 mph":"64 km/h"});
      });

      it('should convert distances less than 5 miles with more accuracy', () => {
        testConvertTrue("2 mi.", "3.2 km", "2 miles");
      });

      it('should convert decimal miles with similar precision', () => {
        testConvertTrue("6.789miles", "10.926 km", "6.789 miles");
      });

      it('should convert numbers with commas', () => {
        testConvertTrue("999,123,456 miles", "1,607,933,339 km");
      });

      it('should convert comma and decimal numbers', () => {
        testConvertTrue("around 1,000.4mph or so", "1,610.0 km/h", "1,000.4 mph");
      });

      it('should convert ranges', () => {
        converter.conversions("It was 1-10 miles long").should.deep.equal({"1 to 10 miles" : "1.6 to 16 km"});
      });

      it('should not convert 0 distance', () => {
        testConvertFalse("0 mile");
        testConvertFalse("0 miles");
        testConvertFalse("0 mph");
        testConvertFalse("0 mi");
      });
    });

    context('Distance is too convenient', () => {
      it('should not convert distance in powers of 10 over 10 miles', () => {
        testConvertFalse("I would walk 100 miles");
        testConvertFalse("I would walk 1000 miles");
        testConvertFalse("I would walk 10000 miles");
        testConvertFalse("I would walk 100,000 miles");
      });
    });

    context('Has no distance to convert', () => {
      it('should not convert with no number', () => {
        testConvertFalse("some miles");
      });

      it('should not convert kilometers', () => {
        testConvertFalse("800 kilometers");
        testConvertFalse("800km");
      });

      it('should not convert deformed numbers', () => {
        testConvertFalse("1,10,2 miles");
      });

      it('should not convert mid-word', () => {
        testConvertFalse("catch22 microscope");
        testConvertFalse("catch 22 microscope");
        testConvertFalse("catch22 mi croscope");
        testConvertFalse("catch22microscope");
      });
    });

    context('Has temperature to convert', () => {
      it('should convert with context', () => {
        testConvertTrue("It's 32°F outside", "0°C", "32°F");
      });

      it('should convert with a degree symbol (32°F)', () => {
        testConvertTrue("32°F", "0°C");
      });

      it('should convert negative temperatures (-32°F)', () => {
        testConvertTrue("-32°F", "-36°C");
      });


      it('should convert with a space (32 °F)', () => {
        testConvertTrue("32 °F", "0°C", "32°F");
      });

      it('should convert Fahrenheit', () => {
        testConvertTrue("32 Fahrenheit", "0°C", "32°F");
      });

      it('should convert negative temperatures degrees fahrenheit', () => {
        testConvertTrue("-32 degrees fahrenheit", "-36°C", "-32°F");
      });

      it('should convert temperature ranges', () => {
        testConvertTrue("32 - -32°F", "0 to -36°C", "32 to -32°F");
        testConvertTrue("It is 32-32°F right now", "0 to 0°C", "32 to 32°F")
        testConvertTrue("Correct you'll need ~ 200 - 220 degrees f for a little while", "93 to 104°C", "200 to 220°F")
      });
    });

    context('No temperature to convert', () => {
      it('should not convert celcius', () => {
        testConvertFalse("It's 32°C outside");
      });
      
      it('should not convert without a °', () => {
        testConvertFalse("I am 23F");
      });

      it('should not convert with special characters', () => {
        testConvertFalse("It's cold (-40°F) outside");
        testConvertFalse("It's about ~32°F outside");
        testConvertFalse("It's >32°F outside");
        testConvertFalse("It's <32°F outside");
      })

      it('should not convert mid-string', () => {
        testConvertFalse("A7F");
        testConvertFalse("8FF");
        testConvertFalse("A-8FF");
        testConvertFalse("hey-8F-F");
      });
    });

    context('Has distance and temperature', () => {
      it('should convert all units in a string', () => {
        converter.conversions("32 °F, -32°F, 1 mile").should.deep.equal({ "32°F": "0°C", "-32°F" : "-36°C", "1 mile" : "1.6 km"});
      });

      it('should semantically convert the same measurement', () => {
        converter.conversions("32mph 32 32°F 32 °F 32mi 32 miles").should.deep.equal({ "32°F" : "0°C", "32 miles" : "51 km", "32 mph" : "51 km/h" })
      });

      it('should convert ranges and singles of different units', () => {
        converter.conversions("101 miles 101-200 degrees F").should.deep.equal({ "101 to 200°F" : "38 to 93°C", "101 miles" : "163 km" })
      });
      
      context('This is kinda weird behaviour, but not important to fix', () => {
        it('should convert ranges and singles of the same units, if it is the first one', () => {
          converter.conversions("101°F 101-200 degrees F").should.deep.equal({ "101 to 200°F" : "38 to 93°C", "101°F" : "38°C" })
        });

        it('should not convert ranges and singles of the same units, if it is the last one', () => {
          converter.conversions("200°F 101-200 degrees F").should.deep.equal({ "101 to 200°F" : "38 to 93°C" })
        });
      });
    })
  });
});