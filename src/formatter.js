/**
 * Formats the scanned files into the requested output format
 * @param {Array} files Array of file objects
 * @param {Object} options Formatting options
 * @returns {string} Formatted output
 */
function formatOutput(files, options) {
  const { format, prefix, summary } = options;
  
  if (format === 'json') {
    return formatAsJson(files, summary);
  } else {
    return formatAsMarkdown(files, prefix, summary);
  }
}

/**
 * Formats files as JSON
 * @param {Array} files Array of file objects
 * @param {boolean} summary Whether to include only file paths
 * @returns {string} JSON string
 */
function formatAsJson(files, summary) {
  if (summary) {
    // For summary mode, just output file paths
    return JSON.stringify({ files: files.map(file => file.path) }, null, 2);
  }
  
  // For full mode, include content
  return JSON.stringify({ 
    files: files.map(file => ({
      path: file.path,
      content: file.content,
      size: file.size
    }))
  }, null, 2);
}

/**
 * Formats files as Markdown
 * @param {Array} files Array of file objects
 * @param {string} prefix Prefix to use for each file
 * @param {boolean} summary Whether to include only file paths
 * @returns {string} Markdown string
 */
function formatAsMarkdown(files, prefix, summary) {
  let output = "# Project Files\n\n";
  
  if (summary) {
    output += "The following is a list of all project files:\n\n";
    
    files.forEach(file => {
      output += `- ${file.path}\n`;
    });
    
    return output;
  }
  
  output += "The following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n";
  
  files.forEach(file => {
    output += `${prefix} ${file.path}:\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
  });
  
  return output;
}

module.exports = { formatOutput };