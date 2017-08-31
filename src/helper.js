const fs = require('fs');
const yaml = require('js-yaml');

function random() {
  return Math.random();
}

function now() {
  return Date.now();
}

function environment() {
  const environmentString = fs.readFileSync("./private/environment.yaml", "utf8")
  return yaml.safeLoad(environmentString);
}

function setIntervalSafely(f, seconds) {
  setInterval(() => {
    try {
      f()
    } catch(e) {
      logError(e)
    }
  }, seconds * 1000);
}

module.exports = {
  "random" : random,
  "now" : now,
  "environment" : environment,
  "log" : console.log,
  "setIntervalSafely" : setIntervalSafely
}
