# To add a conversion:

1) Navigate to the `./src/conversion/` directory
2) Choose a category for your conversion (area, distance, etc.) or create a new one
3) Create a new file within the category directory called `{{your_new_unit}}.js`
4) Add the relevant keys to your `module.exports`

## Key descriptions:

- `imperialUnits` - A list of regular expressions (or strings that will be passed into new RegExp()) that are used to find the imperial units we want to replace.
- `weakImperialUnits` (optional) - A list of sometimes-used units (i.e. "in" for inch), that should only be converted if a different unit of the same kind (i.e. "inch") has been used in the post
- `standardInputUnit` - The unit string that will be displayed to the user at the end of the conversion
- `isInvalidInput` - These inputs should definitely not be converted (i.e. a negative distance)
- `isWeaklyInvalidInput` - These input should probably not be converted (i.e. 8 Mile, the movie, or 1000000 miles, a hyperbole)
- `conversionFunction` - A function that takes in an array of imperial units and a metric transformation function. Returns 
```
  {
    numbers: [ metric-number-1, metric-number-2 ],
    unit: metric-unit
  }
```
- `ignoredUnits` (optional) - If the OP has already converted the units, we don't want to duplicate their efforts. Matches case-insensitively
- `ignoredKeywords` (optional) - Sometimes people yell at us for converting football yards to metric. So here is where we throw keywords that we don't want to convert
- `preprocess` (optional) - A function that runs before any conversions are done that takes the comment and changes the input string into a more easily parsed format (i.e. 6'6" to 6.5 feet)
- `postprocess` (optional) - A function that runs after all conversions have been done that takes the imperial input (6.5 feet) and converts it to a better format (6'6")


# Notes:

- Each conversion is organized by unit, and `conversion_helper.js` will parse each conversion file. 
- Files starting with _ are ignored from the unit conversions. 
= Modules with the longest regex in the "imperialUnits" array will take precedence over shorter ones (so "miles per hour" takes precedence over "miles")
