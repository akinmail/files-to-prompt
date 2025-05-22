const fs = require('fs').promises;

/**
 * Writes output to file or returns it for stdout
 * @param {string} content Content to write
 * @param {string|null} outputPath Output file path or null for stdout
 * @returns {Promise<void>}
 */
async function writeOutput(content, outputPath) {
  if (!outputPath) {
    return; // Will be printed to stdout by caller
  }
  
  try {
    await fs.writeFile(outputPath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write to ${outputPath}: ${error.message}`);
  }
}

module.exports = { writeOutput };