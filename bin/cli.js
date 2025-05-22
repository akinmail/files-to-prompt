#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { version } = require('../package.json');
const { scanFiles } = require('../src/scanner');
const { formatOutput } = require('../src/formatter');
const { writeOutput } = require('../src/output');

program
  .name('files-to-prompt')
  .description('Convert files to a format suitable for LLM prompting')
  .version(version)
  .option('-d, --directory <path>', 'directory to scan (default: current directory)', process.cwd())
  .option('-o, --output <file>', 'output file (use "stdout" to print to console)')
  .option('-f, --format <format>', 'output format: json or markdown (default: markdown)', 'markdown')
  .option('-i, --include <patterns>', 'comma-separated glob patterns to include', '**')
  .option('-e, --exclude <patterns>', 'comma-separated glob patterns to exclude', 'node_modules/**,**/.git/**')
  .option('-m, --max-size <size>', 'maximum file size in KB to include', 100)
  .option('-l, --max-length <length>', 'maximum content length in characters', 1000000)
  .option('-s, --summary', 'include only file paths without content', false)
  .option('-c, --no-color', 'disable colored output')
  .option('-p, --prefix <text>', 'text to prefix each file with', 'File:')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv);

const options = program.opts();

async function run() {
  const spinner = ora('Scanning files...').start();
  
  try {
    // Parse include/exclude patterns
    const includePatterns = options.include.split(',');
    const excludePatterns = options.exclude.split(',');
    
    // Scan files
    const files = await scanFiles({
      directory: options.directory,
      includePatterns,
      excludePatterns,
      maxSize: parseInt(options.maxSize, 10) * 1024, // Convert KB to bytes
      maxLength: parseInt(options.maxLength, 10),
      summary: options.summary,
      verbose: options.verbose
    });

    spinner.succeed(`Found ${chalk.green(files.length)} files`);
    
    if (files.length === 0) {
      console.log(chalk.yellow('No files found matching the criteria.'));
      return;
    }
    
    // Format output
    const output = formatOutput(files, {
      format: options.format,
      prefix: options.prefix,
      summary: options.summary
    });
    
    // Write output
    if (options.output === 'stdout') {
      // Only print to stdout if explicitly requested
      console.log(output);
    } else if (options.output) {
      await writeOutput(output, options.output);
      console.log(chalk.green(`Output written to ${options.output}`));
    } else {
      console.log(chalk.yellow('No output file specified. Use -o stdout to print to console or specify an output file.'));
    }
  } catch (error) {
    spinner.fail('Error scanning files');
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

run();