const fs = require('fs').promises;
const path = require('path');
const { globSync } = require('glob');
const chalk = require('chalk');

/**
 * Scans files based on provided options
 * @param {Object} options Scanning options
 * @returns {Promise<Array>} Array of file objects
 */
async function scanFiles(options) {
  const {
    directory,
    includePatterns,
    excludePatterns,
    maxSize,
    maxLength,
    summary,
    verbose
  } = options;

  // Validate directory exists
  try {
    const stats = await fs.stat(directory);
    if (!stats.isDirectory()) {
      throw new Error(`${directory} is not a directory`);
    }
  } catch (error) {
    throw new Error(`Cannot access directory ${directory}: ${error.message}`);
  }

  // Find files matching patterns
  const files = [];
  const globOptions = {
    cwd: directory,
    ignore: excludePatterns,
    nodir: true,
    absolute: true
  };

  for (const pattern of includePatterns) {
    try {
      const matches = globSync(pattern, globOptions);
      
      for (const filePath of matches) {
        try {
          const stats = await fs.stat(filePath);
          
          // Skip if file exceeds max size
          if (stats.size > maxSize) {
            if (verbose) {
              console.log(chalk.yellow(`Skipping (size): ${filePath} (${formatFileSize(stats.size)})`));
            }
            continue;
          }
          
          let content = '';
          
          // Read file content if not in summary mode
          if (!summary) {
            content = await fs.readFile(filePath, 'utf8');
            
            // Skip if content exceeds max length
            if (content.length > maxLength) {
              if (verbose) {
                console.log(chalk.yellow(`Skipping (length): ${filePath} (${content.length} chars)`));
              }
              continue;
            }
          }
          
          // Add file to the list
          files.push({
            path: path.relative(directory, filePath),
            content,
            size: stats.size
          });
          
          if (verbose) {
            console.log(chalk.green(`Added: ${filePath} (${formatFileSize(stats.size)})`));
          }
        } catch (error) {
          if (verbose) {
            console.log(chalk.red(`Error reading ${filePath}: ${error.message}`));
          }
        }
      }
    } catch (error) {
      throw new Error(`Error in glob pattern "${pattern}": ${error.message}`);
    }
  }
  
  return files;
}

/**
 * Format file size in human-readable form
 * @param {number} bytes File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

module.exports = { scanFiles };