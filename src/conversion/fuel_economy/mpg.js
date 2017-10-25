const shared = require('../shared_conversion_functions');
const fuel_economy = require('./_fuel_economy');

module.exports = {
  "imperialUnits" : [/mpg/, /miles per gal(?:lon)?/],
  "standardInputUnit" : " mpg (US)",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => fuel_economy.toMap(i, (j) => j * 0.425144),
  "ignoredUnits" : fuel_economy.metricUnits,
  "ignoredKeywords" : ["basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                       "nba", "nhl", "nfl", "sport",
                       "play", "game",
                       "mavericks", "denvernuggets", "warriors", "rockets", "laclippers", "lakers", "memphisgrizzlies", 
                       "timberwolves", "nolapelicans", "thunders", "suns", "ripcity", "kings", "nbaspurs", "utahjazz", 
                       "atlantahawks", "bostonceltics", "gonets", "charlottehornets", "chicagobulls", "clevelandcavs", 
                       "detroitpistons", "pacers", "heat", "mkebucks", "nyknicks", "orlandomagic", "sixers", 
                       "torontoraptors", "washingtonwizards"].concat(shared.ukSubreddits)
}