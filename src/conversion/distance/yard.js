const shared = require('../shared');
const distance = require('./_distance');

module.exports = {
  "imperialUnits" : [/yards?/],
  "standardInputUnit" : " yards",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 0.9144),
  "ignoredUnits" : distance.metricUnits,
  "ignoredKeywords": ["football", "golf", "(?:touch)?down", "cfl", "nfl", "wow",
                      "denverbroncos", "kansascitychiefs", "chargers", "oaklandraiders",
                      "texans", "colts", "jaguars", "tennesseetitans", "ravens",
                      "bengals", "browns", "steelers", "buffalobills", "miamidolphins",
                      "patriots", "nyjets", "cowboys", "nygiants", "eagles", "redskins",
                      "chibears", "detroitlions", "greenbaypackers", "minnesotavikings",
                      "falcons", "panthers", "saints", "buccaneers", "azcardinals",
                      "losangelesrams", "49ers", "seahawks"]
}
