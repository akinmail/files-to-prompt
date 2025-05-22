const assert = require('assert').strict;
const path = require('path');
const fs = require('fs').promises;
const { scanFiles } = require('../src/scanner');
const { formatOutput } = require('../src/formatter');

async function createTestDirectory() {
  const testDir = path.join(__dirname, 'test-files');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create test files
    await fs.writeFile(path.join(testDir, 'file1.js'), 'console.log("Hello, world!");');
    await fs.writeFile(path.join(testDir, 'file2.txt'), 'This is a text file.');
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    await fs.writeFile(path.join(testDir, 'subdir', 'file3.js'), 'function test() { return true; }');
    
    return testDir;
  } catch (error) {
    console.error('Error creating test directory:', error);
    throw error;
  }
}

async function cleanupTestDirectory(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up test directory:', error);
  }
}

async function runTests() {
  let testDir;
  
  try {
    console.log('Setting up test environment...');
    testDir = await createTestDirectory();
    
    console.log('Running tests...');
    
    // Test scanFiles
    const files = await scanFiles({
      directory: testDir,
      includePatterns: ['**'],
      excludePatterns: [],
      maxSize: 1024 * 1024,
      maxLength: 1000000,
      summary: false,
      verbose: false
    });
    
    assert.equal(files.length, 3, 'Should find 3 files');
    assert(files.some(f => f.path.endsWith('file1.js')), 'Should find file1.js');
    assert(files.some(f => f.path.endsWith('file2.txt')), 'Should find file2.txt');
    assert(files.some(f => f.path.endsWith('file3.js')), 'Should find file3.js');
    
    // Test file content
    const file1 = files.find(f => f.path.endsWith('file1.js'));
    assert.equal(file1.content, 'console.log("Hello, world!");', 'Content of file1.js should match');
    
    // Test include pattern
    const jsFiles = await scanFiles({
      directory: testDir,
      includePatterns: ['**/*.js'],
      excludePatterns: [],
      maxSize: 1024 * 1024,
      maxLength: 1000000,
      summary: false,
      verbose: false
    });
    
    assert.equal(jsFiles.length, 2, 'Should find 2 JS files');
    assert(jsFiles.every(f => f.path.endsWith('.js')), 'All files should be JS files');
    
    // Test exclude pattern
    const noSubdirFiles = await scanFiles({
      directory: testDir,
      includePatterns: ['**'],
      excludePatterns: ['**/subdir/**'],
      maxSize: 1024 * 1024,
      maxLength: 1000000,
      summary: false,
      verbose: false
    });
    
    assert.equal(noSubdirFiles.length, 2, 'Should find 2 files (excluding subdir)');
    assert(noSubdirFiles.every(f => !f.path.includes('subdir')), 'No files should be from subdir');
    
    // Test formatOutput - JSON
    const jsonOutput = formatOutput(files, {
      format: 'json',
      prefix: 'File:',
      summary: false
    });
    
    const jsonParsed = JSON.parse(jsonOutput);
    assert.equal(jsonParsed.files.length, 3, 'JSON should contain 3 files');
    assert(jsonParsed.files[0].content !== undefined, 'JSON should include file content');
    
    // Test formatOutput - Markdown
    const markdownOutput = formatOutput(files, {
      format: 'markdown',
      prefix: 'File:',
      summary: false
    });
    
    assert(markdownOutput.includes('# Project Files'), 'Markdown should have a title');
    assert(markdownOutput.includes('File: '), 'Markdown should include the file prefix');
    assert(markdownOutput.includes('```'), 'Markdown should format code blocks');
    
    // Test summary mode
    const summaryOutput = formatOutput(files, {
      format: 'markdown',
      prefix: 'File:',
      summary: true
    });
    
    assert(!summaryOutput.includes('```'), 'Summary should not include code blocks');
    assert(summaryOutput.includes('- '), 'Summary should list files with bullets');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    if (testDir) {
      await cleanupTestDirectory(testDir);
      console.log('Test cleanup completed.');
    }
  }
}

runTests();