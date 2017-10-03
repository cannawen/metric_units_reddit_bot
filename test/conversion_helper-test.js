const should = require('chai').should();

const ch = require('../src/conversion_helper');

describe('conversion_helper', () => {
  describe('#shouldConvertComment()', () => {
    context('comment contains quote', () => {
      it('should not convert', () => {
        const comment = createComment("foo", "bar", "\n&gt; About 202 miles away");
        ch.shouldConvertComment(comment, []).should.be.false;

        const comment2 = createComment("foo", "bar", ">1.5lbs");
        ch.shouldConvertComment(comment2, []).should.be.false;
      });
    });

    it('should convert if ignored keywords do not match', () => {
      const ignoredKeywords = ["foo", "bar"];
      const comment = createComment("hello", "foobar", "foobar");
      ch.shouldConvertComment(comment, ignoredKeywords).should.be.true;
    });

    context('comment contains ignored keyword', () => {
      it('should not convert if subreddit matches', () => {
        const ignoredKeywords = ["foo", "bar"];
        const comment = createComment("foobar", "hello", "hello");
        ch.shouldConvertComment(comment, ignoredKeywords).should.be.false;
      });

      it('should not convert if post title matches', () => {
        const ignoredKeywords = ["foo", "bar"];
        const comment = createComment("hello", "This the bar stuff", "hello");
        ch.shouldConvertComment(comment, ignoredKeywords).should.be.false;
      });

      it('should not convert if body matches', () => {
        const ignoredKeywords = ["foo", "bar"];
        const comment = createComment("hello", "hello", "foo");
        ch.shouldConvertComment(comment, ignoredKeywords).should.be.false;
      });
    });
  });

  describe('#findPotentialConversions()', () => {
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

      context('and oz', () => {
        it('should convert', () => {
          verifyPotentialConversions(
            [
              "1 lb 16oz",
              "2 pound 8 oz",
              "3 pound 20 oz"
            ],
            ["2.00", "2.50"],
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
            ],
            [1, 2],
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
              "4,000'0\"",
              "12'000",
              "2004-'05"
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

    context('foot-pound', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1footpound",
            "2pound-foot",
            "3ftlb",
            "4lb·ft",
            "5-foot-pounds",
            "6 lb-ft"
          ],
          [1, 2, 3, 4, 5, 6],
          " ft·lbf"
        );
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
            "5-inch"
          ],
          [1, 2, 3, 4, 5],
          " inches"
        );
      });

      context('when confident about one conversion', () => {
        it('should convert those with less confidence', () => {
          verifyPotentialConversions(
            [
              "1inch",
              "2\"",
              "3 in",
              "4-in",
            ],
            [1, 2, 3, 4],
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
          "-1°F",
          [-1],
          "°F"
        );
      });
    });

    context('numbers with commas should be found', () => {
      it('should find conversions', () => {
        verifyPotentialConversions(
          [
            "1,000°F",
            "1,000,000°F"
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
            "1.1°F",
            "-2.22°F",
            "3,333.333°F",
            "-44,444.4444°F"
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
            "1-2°F",
            "-3 to -4°F"
          ],
          [1, 2, -3, -4],
          "°F"
        );
      });
    });

    context('contains ignored keywords', () => {
      it('should not convert', () => {
        verifyPotentialConversions(
          [
            "size 11 feet",
            "he plays basketball 32 mpg every day",
            "7°F",
            "some°C"
          ],
          undefined
        );
      });

      context('contains non-ignored conversion', () => {
        it('should convert non-ignored conversion', () => {
          verifyPotentialConversions(["size 5 lbs and 11 feet"], [5], " lb");
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

          memo.push(createImperialMap(inputNumber, inputUnit));

          return memo;
        }, expectedOutput);
      }

      const comment = createComment("foobar", "foobar", input);
      ch.findPotentialConversions(comment).should.deep.equal(expectedOutput);
    }
  });

  describe('#filterConversions()', () => {
    context('lbs', () => {
      it('should allow normal numbers', () => {
        verifyFilterConversions([1, 2, 3], " lb", [1, 2, 3]);
      });

      it('should not allow zero or negative values', () => {
        verifyFilterConversions([0, -10], " lb", undefined);
      });

      it('should not allow when values are likely hyperbole', () => {
        verifyFilterConversions([100, 1000, 100000000000000000000000], " lb", undefined);
      });
    });

    context('feet', () => {
      it('should allow normal numbers', () => {
        verifyFilterConversions([3, 5, 7], " feet", [3, 5, 7]);
      });

      it('should not allow zero or negative values', () => {
        verifyFilterConversions([0, -10], " feet", undefined);
      });

      it('should not allow when values are likely hyperbole', () => {
        verifyFilterConversions([100, 1000, 10000], " feet", undefined);
      });

      it('should not allow common values', () => {
        verifyFilterConversions([1, 2, 4, 6], " feet", undefined);
      });
    });

    context('inches', () => {
      it('should allow normal numbers', () => {
        verifyFilterConversions([1, 2, 3], " inches", [1, 2, 3]);
      });

      it('should not allow zero or negative values', () => {
        verifyFilterConversions([0, -10], " inches", undefined);
      });

      it('should not allow when values are likely hyperbole', () => {
        verifyFilterConversions([100, 1000, 10000], " inches", undefined);
      });
    });

    context('miles', () => {
      it('should allow normal numbers', () => {
        verifyFilterConversions([1, 2, 3], " miles", [1, 2, 3]);
      });

      it('should not allow zero or negative values', () => {
        verifyFilterConversions([0, -10], " miles", undefined);
      });

      it('should not allow when values are likely hyperbole', () => {
        verifyFilterConversions([100, 1000, 10000], " miles", undefined);
      });

      it('should not allow common values', () => {
        verifyFilterConversions([8], " miles", undefined);
      });
    });

    context('mph', () => {
      it('should allow normal numbers', () => {
        verifyFilterConversions([1, 2, 3], " mph", [1, 2, 3]);
      });

      it('should not allow zero or negative values', () => {
        verifyFilterConversions([0, -10], " mph", undefined);
      });

      it('should not allow when values are likely hyperbole', () => {
        verifyFilterConversions([100, 1000, 10000], " mph", undefined);
      });

      it('should not allow common values', () => {
        verifyFilterConversions([60, 88], " mph", undefined);
      });
    });

    context('mpg', () => {
      it('should allow normal numbers', () => {
        verifyFilterConversions([1, 2, 3], " mpg (US)", [1, 2, 3]);
      });

      it('should not allow zero or negative values', () => {
        verifyFilterConversions([0, -10], " mpg (US)", undefined);
      });

      it('should not allow when values are likely hyperbole', () => {
        verifyFilterConversions([100, 1000, 10000], " mpg (US)", undefined);
      });
    });

    context('°F', () => {
      it('should allow normal numbers', () => {
        verifyFilterConversions([1, 2, 3], "°F", [1, 2, 3]);
      });

      it('should not allow when values are too big', () => {
        verifyFilterConversions([1001, 78639], "°F", undefined);
      });
    });

    context('Mix of invalid and weak conversions', () => {
      it('should not convert', () => {
        const potentialConversions = [
          createImperialMap(-10, " lb"),
          createImperialMap(10000, " lb"),
          createImperialMap(2, " feet"),
        ];

        ch.filterConversions(potentialConversions).should.deep.equal([]);

      });
    });

    context('Mix of invalid, weak, and strong conversions', () => {
      it('should allow weak and strong conversions', () => {        
        const potentialConversions = [
          createImperialMap(3, " lb"),
          createImperialMap(-10, " lb"),
          createImperialMap(10000, " lb"),
          createImperialMap(2, " feet"),
        ];
        
        const expectedConversions = [
          createImperialMap(3, " lb"),
          createImperialMap(10000, " lb"),
          createImperialMap(2, " feet"),
        ];

        ch.filterConversions(potentialConversions).should.deep.equal(expectedConversions);
      });
    });

    function verifyFilterConversions(values, unit, expectedValues = []) {
      const potentialConversions = values.reduce((memo, value) => {
        memo.push(createImperialMap(value, unit));
        return memo;
      }, []);
      
      const expectedConversions = expectedValues.reduce((memo, value) => {
        memo.push(createImperialMap(value, unit));
        return memo;
      }, []);

      ch.filterConversions(potentialConversions).should.deep.equal(expectedConversions);
    }
  });

  describe('#calculateMetric()', () => {
    context('lbs', () => {
      context('under 1 kg', () => {
        it('should convert to g', () => {
          verifyConversion(1, " lb", 453.592, " g");
        });
      });
      
      context('under 1,000 kg', () => {
        it('should convert to kg', () => {
          verifyConversion(3, " lb", 1.3607759999999998, " kg");
        });
      });

      context('over 1,000 kg', () => {
        it('should convert to g', () => {
          verifyConversion(2222, " lb", 1.007881424, " metric tons");
        });
      });
    });

    context('feet', () => {
      it('should convert', () => {
        verifyConversion(1, " feet", 30.48, " cm");
        verifyConversion(4, " feet", 1.2192, " metres");
      });
    });

    context('foot-pounds', () => {
      it('should convert', () => {
        verifyConversion(1, " ft·lbf", 1.355818, " Nm");
      });
    });

    context('inches', () => {
      it('should convert in cm', () => {
        verifyConversion(1, " inches", 2.54, " cm");
      });

      context('less than 1 cm', () => {
        it('should convert in mm', () => {
          verifyConversion(0.38, " inches", 9.652, " mm");
        });
      });
    });

    context('miles', () => {
      it('should convert to km', () => {
        verifyConversion(1, " miles", 1.609344, " km");
      });

      context('greater than 0.01 light-year', () => {
        it('should convert to light-years', () => {
          verifyConversion(58786253732, " miles", 0.010000000000027884, " light-years");
        });
      });

      context('greater than or equal to 1 light-second', () => {
        it('should convert to light-seconds', () => {
            verifyConversion(372565, " miles", 2.000001105297986, " light-seconds");
        });
      });
    });

    context('mph', () => {
      context('input < 200', () => {
        it('should convert km/h', () => {
          verifyConversion(1, " mph", 1.609344, " km/h");
        });
      });

      context('input >= 200', () => {
        it('should convert km/h and m/s', () => {
          const imperialMap = createImperialMap(200, " mph");
          const expectedOutput = Object.assign({}, imperialMap);

          expectedOutput['metric'] = [
            { "number" : "321.8688", "unit" : " km/h"},
            { "number" : "89.408", "unit" : " metres/s" }
          ];

          ch.calculateMetric([imperialMap]).should.deep.equal([expectedOutput]);
        });
      });

      context('input >= 0.01 speed of light', () => {
        it('should convert c', () => {
          verifyConversion(6706166, " mph", 0.009999999561830132, "c");
        });
      });
    });

    context('mpg', () => {
      context('input < 15', () => {
        it('should convert only with delta', () => {
          verifyConversion(14, " mpg (US)", 5.952016, " km/L");
        });
      });

      context('input >= 15', () => {
        it('should convert with L/100km', () => {
          const imperialMap = createImperialMap(15, " mpg (US)");
          const expectedOutput = Object.assign({}, imperialMap);

          expectedOutput['metric'] = [
            { "number" : "6.37716", "unit" : " km/L"},
            { "number" : "15.681000000000001", "unit" : " L/100km" }
          ];

          ch.calculateMetric([imperialMap]).should.deep.equal([expectedOutput]);
        });
      });
    });

    context('°F', () => {
      context('input between 0 and 32', () => {
        it('should convert with delta', () => {
          const imperialMap = createImperialMap(10, "°F");
          const expectedOutput = Object.assign({}, imperialMap);

          expectedOutput['metric'] = [
            { "number" : "-12.222222222222221", "unit" : "°C"},
            { "number" : "5.555555555555555", "unit" : " change in °C" }
          ];

          ch.calculateMetric([imperialMap]).should.deep.equal([expectedOutput]);
        });
      });

      context('input not between 0 and 32', () => {
        it('should convert without delta', () => {
          verifyConversion(32, "°F", 0, "°C");
          verifyConversion(0, "°F", -17.77777777777778, "°C");
          verifyConversion(-40, "°F", -40, "°C");
        });
      });
    });

    context('volumetric units', () => {
      context('under 1 L', () => {
        it('should convert to mL', () => {
          verifyConversion(1, " fl. oz.", 29.5735295625, " mL");
        });
      });

      context('under 1,000 L', () => {
        it('should convert to L', () => {
          verifyConversion(200, " fl. oz.", 5.9147059125, " L");
        });
      });

      context('over 1,000 L', () => {
        it('should convert to m^3', () => {
          verifyConversion(2222, " gal (US)", 8.41118102, " m^3");
        });
      });

      context('over 1,000000000000 L', () => {
        it('should convert to km^3', () => {
          verifyConversion(987654321012, " gal (US)", 3.7386765433020352, " km^3");
        });
      });
    });

    function verifyConversion(imperialNumber, imperialUnit, metricNumber, metricUnit) {
      const imperialMap = createImperialMap(imperialNumber, imperialUnit);

      const expectedOutput = Object.assign({}, imperialMap);
      expectedOutput['metric'] = { "number" : metricNumber.toString(), "unit" : metricUnit };

      ch.calculateMetric([imperialMap]).should.deep.equal([expectedOutput])
    }
  });

  describe('#roundConversions()', () => {
    context('has decimal places', () => {
      it('should convert with output decimal places', () => {
        verifyRounding(6.66, 1.2345678, 1.23);
        verifyRounding(6.6, -1.99872, "-2.0");
      });
    });

    context('whole input', () => {
      context('input not ending in 0', () => {
        it('should round to 3%', () => {
          verifyRounding(3, 96.888, 97);
          verifyRounding(3, -98.88, -100);
        });
      });

      context('input ending in 0', () => {
        context('smaller than 100', () => {
          it('should round to 3%', () => {
            verifyRounding(20, 96.888, 97);
            verifyRounding(20, -98.88, -100);
          });        
        });

        context('greater than 100', () => {
          it('should round to 5%', () => {
            verifyRounding(200, 96.888, 100);
            verifyRounding(200, -94.88, -95);
          });        
        });
      });
    });

    function verifyRounding(imperial, metric, expected) {
      const input = {
        'imperial' : createMap(imperial, 'foo'),
        'metric' : createMap(metric, 'bar')
      }
      const expectedOut = Object.assign({}, input, {'rounded' : createMap(expected, 'bar')});

      ch.roundConversions([input])[0]
        .should
        .deep
        .equal(expectedOut);
    }
  });

  describe('#formatConversion()', () => {
    context('number under 1,000', () => {
      it('should not change', () => {
        verifyUserFacing("999", "999");
      });
    });

    context('number over 1,000', () => {
      it('should add commas', () => {
        verifyUserFacing("1000", "1,000");
        verifyUserFacing("1000.00", "1,000.00");
        verifyUserFacing("1000000", "1,000,000");
      });
    });

    function verifyUserFacing(rounded, expected) {
      const input = {
        'imperial' : createMap(1, ' miles'),
        'metric' : createMap(1, 'bar'),
        'rounded' : createMap(rounded, 'bar')
      }
      const expectedOut = Object.assign({}, input, {'formatted' : createMap(expected, 'bar')});

      ch.formatConversion([input])[0]
        .should
        .deep
        .equal(expectedOut);
    }

    context('feet', () => {
      context('decimal', () => {
        it('should convert', () => {
          const actual = ch.formatConversion([{
            'imperial' : createMap(1000.25, " feet"),
            'metric' : createMap(2, " metres"),
            'rounded' : createMap(2, " metres")
          }])[0];

          const expected = {
            'imperial' : createMap("1,000'3\"", ""),
            'metric' : createMap(2, " metres"),
            'rounded' : createMap(2, " metres"),
            'formatted' : createMap(2, " metres")
          }


          actual.should.deep.equal(expected);
        });
      });

      context('whole', () => {
        it('should convert', () => {
          const actual = ch.formatConversion([{
            'imperial' : createMap(5, " feet"),
            'metric' : createMap(2, " metres"),
            'rounded' : createMap(2, " metres")
          }])[0];

          const expected = {
            'imperial' : createMap("5 feet", ""),
            'metric' : createMap(2, " metres"),
            'rounded' : createMap(2, " metres"),
            'formatted' : createMap(2, " metres")
          }

          actual.should.deep.equal(expected);
        });
      });
    });
  });
});

function createImperialMap(value, unit) {
  return { "imperial" : createMap(value, unit) };
}

function createMap(value, unit) {
  return {
    "number" : value.toString(),
    "unit" : unit
  };
}

function createComment(subreddit, title, text) {
  return {
    "subreddit" : subreddit,
    "postTitle" : title,
    "body" : text
  }
}
