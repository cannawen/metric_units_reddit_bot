const fs = require('fs');
const path = require('path');

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function getDirectories(source) {
  return fs.readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory);
}

function getFilesNotStartingWithUnderscore(source) {
  return fs.readdirSync(source)
    .filter(name => !name.startsWith('_') && !name.startsWith('.'))
    .map(name => path.join(source, name))
    .filter(i => !isDirectory(i));
}

function getAllPaths(dirpath) {
  return getDirectories(dirpath) // Array of directories
    .map(getFilesNotStartingWithUnderscore) // Array of file arrays
    .reduce((memo, value) => memo.concat(value), []); // Flatten into array of files
}

module.exports = {
  getAllPaths,
};
