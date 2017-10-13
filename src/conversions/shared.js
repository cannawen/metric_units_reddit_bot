
const ukSubreddits = ["britain", "british", "england", "english", "scotland", "scottish", "wales", "welsh", "ireland", "irish", "london", "uk"];
function distanceMap(m) {
  const unitDecider = Math.max(...m);
  if (unitDecider < 0.01) {
    return createMap(m.map((i) => i * 1000), " mm");

  } else if (unitDecider < 1) {
    return createMap(m.map((i) => i * 100), " cm");

  } else if (unitDecider > 94607304725808) {
    return createMap(m.map((i) => i/9460730472580800), " light-years");


  } else if (unitDecider >= 3218688000) {
    return createMap(m.map((i) => i/299792458), " light-seconds");

  } else if (unitDecider >= 1000) {
    return createMap(m.map((i) => i/1000), " km");

  } else {
    return createMap(m, " metres");
  }
}

function weightMap(g) {
  const kg = g.map((i) => i / 1000);
  const unitDecider = Math.max(...g);
  const unitDeciderKg = unitDecider/1000;
  if (unitDecider < 1000) {
    return createMap(g, " g");

  } else if (unitDeciderKg < 1000) {
    return createMap(kg, " kg");

  } else {
    return createMap(kg.map((i) => i / 1000), " metric tons");
  }
}

function volumeMap(l) {
  const unitDecider = Math.max(...l);
  if (unitDecider < 1) {
    return createMap(l.map((i) => i * 1000), " mL");

  } else if (unitDecider > 1000000000000) {
    return createMap(l.map((i) => i / 1000000000000), " km^3");

  } else if (unitDecider > 1000) {
    return createMap(l.map((i) => i / 1000), " m^3");

  } else {
    return createMap(l, " L");
  }
}

function areaMap(m2) {
  const unitDecider = Math.max(...m2);
  if (unitDecider >= 1000000) {
    return createMap(m2.map((i) => i / 1000000), " km^2");

  } else if (unitDecider >= 10000) {
    return createMap(m2.map((i) => i / 10000), " hectares");

  } else {
    return createMap(m2, " m^2");
  }
}

function pressureMap(pa) {
  const unitDecider = Math.max(...pa);
  if (unitDecider < 1000) {
    return createMap(pa, " Pa");

  } else {
    const kPa = pa.map((i) => i / 1000);

    return createMap(kPa, " kPa");
  }
}

function velocityMap(mPerS) {
  const unitDecider = Math.max(...mPerS);
  if (unitDecider < 89.408) {
    return createMap(mPerS.map((i) => i * 3.6), " km/h");

  } else if (unitDecider >= 2997924.58) {
    return createMap(mPerS.map((i) => i / 299792458), "c");

  } else {
    let perSMap = distanceMap(mPerS, ((i) => i));
    perSMap['unit'] += "/s";

    return [createMap(mPerS.map((i) => i * 3.6), " km/h"), perSMap];
  }
}

function createMap(value, unit) {
  return {
    "numbers" : value.map((i) => i.toString()),
    "unit" : unit
  };
}

function isZeroOrNegative(i) {
  return i <= 0;
}

function isHyperbole(i) {
  const isOneFollowedByZeros = i.toString().match(/^100+(?:\.0+)?$/) !== null;
  const isOneFollowedByExponentTerm = i.toString().match(/1e(?:\d)*/) !== null;
  return isOneFollowedByZeros || isOneFollowedByExponentTerm;
}

module.exports = {
  "distanceMap": distanceMap,
  "weightMap" : weightMap,
  "volumeMap" : volumeMap,
  "areaMap" : areaMap,
  "pressureMap" : pressureMap,
  "velocityMap" : velocityMap,
  "createMap" : createMap,

  "isZeroOrNegative" : isZeroOrNegative,
  "isHyperbole" : isHyperbole,
  "ukSubreddits" : ukSubreddits
}