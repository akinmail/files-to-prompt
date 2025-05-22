const { scanFiles } = require('./scanner');
const { formatOutput } = require('./formatter');
const { writeOutput } = require('./output');

module.exports = {
  scanFiles,
  formatOutput,
  writeOutput
};