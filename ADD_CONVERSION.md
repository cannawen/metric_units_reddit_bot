Modules with the longest regex in the "imperialUnits" array will take precedence over shorter ones (so "miles per hour" takes precedence over "miles")

Here is a description of what each key in the objects means:

imperialUnits - A list of regular expressions (or strings that will be passed into new RegExp()) that are used to find the imperial units we want to replace.

weakImperialUnits (optional) - A list of sometimes-used units (i.e. "in" for inch), that should only be converted if a different unit of the same kind (i.e. "inch") has been used in the post

standardInputUnit - The unit string that will be displayed to the user at the end of the conversion

isInvalidInput - These inputs should definitely not be converted (i.e. a negative distance)

isWeaklyInvalidInput - These input should probably not be converted (i.e. 8 Mile, the movie, or 1000000 miles, a hyperbole)

conversionFunction - A function that gets passed in a number, and returns the metric conversion in the form
  {
    numbers: metric-number,
    unit: metric-unit
  }

ignoredUnits (optional) - If the OP has already converted the units, regardless of case sensitivity, we don't want to duplicate their efforts! 

ignoredKeywords (optional) - Sometimes people yell at us for converting football yards to metric. So here is where we throw keywords that we don't want to convert

preprocess (optional) - A function that runs before any conversions are done that takes the comment and changes the input string into a more easily parsed format (i.e. 6'6" to 6.5 feet)

postprocess (optional) - A function that runs after all conversions have been done that takes the imperial input (6.5 feet) and converts it to a better format (6'6")