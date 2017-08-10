const fs = require('fs');
const yaml = require('js-yaml');

function random() {
  return Math.random();
}

function environment() {
  const environmentString = fs.readFileSync("./private/environment.yaml", "utf8")
  return yaml.safeLoad(environmentString);
}

module.exports = {
  "random": random,
  "environment" : environment
}