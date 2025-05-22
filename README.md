# files-to-prompt

A Node.js tool to convert files to a format suitable for LLM prompting.

This is a JavaScript implementation of [Simon Willison's `files-to-prompt` tool](https://github.com/simonw/files-to-prompt), designed to prepare file contents for use in prompts to language models like GPT-4.

## Installation

```bash
npm install -g files-to-prompt
```

Or use without installation:

```bash
npx files-to-prompt [options]
```

## Usage

```bash
files-to-prompt [options]
```

### Options

```
-d, --directory <path>     directory to scan (default: current directory)
-o, --output <file>        output file (default: stdout)
-f, --format <format>      output format: json or markdown (default: markdown)
-i, --include <patterns>   comma-separated glob patterns to include (default: **)
-e, --exclude <patterns>   comma-separated glob patterns to exclude 
                           (default: node_modules/**,**/.git/**)
-m, --max-size <size>      maximum file size in KB to include (default: 100)
-l, --max-length <length>  maximum content length in characters (default: 1000000)
-s, --summary              include only file paths without content
-c, --no-color             disable colored output
-p, --prefix <text>        text to prefix each file with (default: "File:")
-v, --verbose              verbose output
-h, --help                 display help for command
-V, --version              output the version number
```

## Examples

Scan the current directory and output all files in Markdown format:

```bash
files-to-prompt
```

Scan a specific directory and save to a file:

```bash
files-to-prompt --directory ./my-project --output prompt.md
```

Include only JavaScript files:

```bash
files-to-prompt --include "**/*.js"
```

Exclude test files:

```bash
files-to-prompt --exclude "**/*.test.js,**/*.spec.js"
```

Output as JSON:

```bash
files-to-prompt --format json
```

Generate a summary of files without their contents:

```bash
files-to-prompt --summary
```

## Programmatic Usage

```javascript
const { scanFiles, formatOutput, writeOutput } = require('files-to-prompt');

async function generatePrompt() {
  const files = await scanFiles({
    directory: './my-project',
    includePatterns: ['**/*.js'],
    excludePatterns: ['node_modules/**', '**/.git/**'],
    maxSize: 102400, // 100KB
    maxLength: 1000000,
    summary: false,
    verbose: false
  });
  
  const output = formatOutput(files, {
    format: 'markdown',
    prefix: 'File:',
    summary: false
  });
  
  // Write to file
  await writeOutput(output, 'prompt.md');
  
  // Or use the output directly
  console.log(output);
}

generatePrompt();
```

## License

MIT

## Credits

Based on the Python tool [files-to-prompt](https://github.com/simonw/files-to-prompt) by Simon Willison.