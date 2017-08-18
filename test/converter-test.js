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
      it.skip('should collapse ranges if needed', () => {
        // Story #150197623
        converter.conversions("100-101 degrees F ").should.deep.equal({ "100 to 101°F" : "38°C" });
      });
    });

    context('has feet', () => {
      it('should convert', () => {
        converter.conversions("1-foot, 2 feet, 3', 4-5ft, 5 foot")
        .should.deep.equal({
          "1 foot" : "0.3 meters",
          "2 feet" : "0.6 meters",
          "3 feet" : "0.9 meters",
          "4 to 5 feet" : "1.2 to 1.5 meters",
        });
      });
    });

    context('has inches', () => {
      it('should convert', () => {
        converter.conversions("1-inch, 2 inch, 3\", 4-5in, 6 inches")
        .should.deep.equal({
          "1 inch" : "2.5 cm",
          "2 inches" : "5.1 cm",
          "3 inches" : "7.6 cm",
          "4 to 5 inches" : "10 to 13 cm",
          "6 inches" : "15 cm"
        });
      });
    });

    context('has feet and inches', () => {
      it('should convert', () => {
        converter.conversions("1'2\", 3\"2', 3 foot 2 inches")
        .should.deep.equal({
           "1.2 feet" : "0.4 meters",
           "3.2 feet" : "1.0 meter"
         });
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

      it('should convert miles per hour', () => {
        testConvertTrue("999,123,456 miles per hour", "1,607,933,339 km/h", "999,123,456 mph");
      });

      it('should convert distances less than 5 miles with more accuracy', () => {
        testConvertTrue("~2 mi.", "3.2 km", "2 miles");
        testConvertTrue("0.2 mi.", "0.3 km", "0.2 miles");
        testConvertTrue(".2-mile radius", "0.3 km", ".2 miles");
      });

      it('should convert decimal miles with similar precision', () => {
        testConvertTrue("6.789miles", "10.926 km", "6.789 miles");
      });

      it('should convert numbers with commas', () => {
        testConvertTrue("999,123,456 miles", "1,607,933,339 km");
      });

      it('should convert comma and decimal numbers', () => {
        testConvertTrue("around 1,000.4 miles an hour or so", "1,610.0 km/h", "1,000.4 mph");
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

    context('Has no distance to convert', () => {
      context('Distance is too convenient', () => {
        it('should not convert distance in powers of 10 over 10 miles', () => {
          testConvertFalse("I would walk 100 miles");
          testConvertFalse("I would walk 1000 miles");
          testConvertFalse("I would walk 10000 miles");
          testConvertFalse("I would walk 100,000 miles");
        });
      });

      context('Negative miles', () => {
        it('should not convert', () => {
          testConvertFalse("I would walk -10 miles");
        });
      });

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

    context('Has fuel economy to convert', () => {
      it('should convert miles per gallon', () => {
        testConvertTrue("50 miles per gallon", "4.7 L/100km", "50 mpg (US)");
      });      

      it('should convert miles per gallon range', () => {
        testConvertTrue(" 0 - 50 miles per gallon ", "Infinity to 4.7 L/100km", "0 to 50 mpg (US)");
      });
    });

    context('Has temperature to convert', () => {
      it('should convert with context', () => {
        testConvertTrue("It's 32°F outside", "0°C", "32°F");
        testConvertTrue("It's about ~32°F outside", "0°C", "32°F");
        testConvertTrue("It's >32°F outside", "0°C", "32°F");
        testConvertTrue("It's <32°F outside", "0°C", "32°F");
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
        testConvertTrue("It is 32-32°F right now", "0 to 0°C", "32 to 32°F");
        testConvertTrue("Correct you'll need ~ 200 - 220 degrees f for a little while", "93 to 104°C", "200 to 220°F");
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
      });

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
        converter.conversions("32mph, 32, 32°F, -32°F, 32 °F, 32mi, 32 miles").should.deep.equal({ "-32°F" : "-36°C", "32°F" : "0°C", "32 miles" : "51 km", "32 mph" : "51 km/h" });
      });

      it('should convert ranges and singles of different units', () => {
        converter.conversions("101 miles 101-200 degrees F").should.deep.equal({ "101 to 200°F" : "38 to 93°C", "101 miles" : "163 km" });
      });
      
      context('This is kinda weird behaviour, but not important to fix', () => {
        it('should convert ranges and singles of the same units, if it is the first one', () => {
          converter.conversions("101°F 101-200 degrees F").should.deep.equal({ "101 to 200°F" : "38 to 93°C", "101°F" : "38°C" });
        });

        it('should not convert ranges and singles of the same units, if it is the last one', () => {
          converter.conversions("200°F 101-200 degrees F").should.deep.equal({ "101 to 200°F" : "38 to 93°C" });
        });
      });
    })
  });
});
