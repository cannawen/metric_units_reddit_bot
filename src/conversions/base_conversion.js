class Conversion {
  constructor (imperialUnits, standardInputUnit, conversionFunction, ignoredUnits, ignoredKeywords) {
    this.imperialUnits = imperialUnits;
    this.standardInputUnit = standardInputUnit;
    this.conversionFunction = conversionFunction;
    this.ignoredUnits = ignoredUnits;
    this.ignoredKeywords = ignoredKeywords;

    this.isInvalidInput = isZeroOrNegative;
    this.isWeaklyInvalidInput = isHyperbole;
  }

  setCustomInvalidInput (isInvalidInput) {
    this.isInvalidInput = isInvalidInput;
  }

  setCustomWeaklyInvalidInput (isWeaklyInvalidInput) {
    this.isWeaklyInvalidInput = isWeaklyInvalidInput;
  }
}