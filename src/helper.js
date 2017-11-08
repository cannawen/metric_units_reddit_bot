const fs = require('fs');
const yaml = require('js-yaml');
const mkdirp = require('mkdirp');
const Console = require('console');

function random() {
  return Math.random();
}

function now() {
  return Date.now();
}

function environment() {
  const environmentString = fs.readFileSync('./private/environment.yaml', 'utf8');
  return yaml.safeLoad(environmentString);
}

function logError(error) {
  Console.log(error.stack);
  const dir = `./private/errors/${environment.version}/`;
  mkdirp(dir);
  fs.writeFileSync(`${dir + now()}.txt`, error.stack, 'utf8');
}

function setIntervalSafely(f, seconds) {
  setInterval(() => {
    try {
      f();
    } catch (e) {
      logError(e);
    }
  }, seconds * 1000);
}

module.exports = {
  random,
  now,
  environment,
  log: Console.log,
  logError,
  setIntervalSafely,
};
