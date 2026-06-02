// Script to fix API URL replacements
const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  'app',
  'components',
  'contexts',
  'lib',
  'hooks'
];

// Counter for tracking
let totalFiles = 0;
let updatedFiles = 0;

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Skip files that don't need fixing
  if (!content.includes('${API_URL}') && !content.includes('import { API_URL }')) {
    return;
  }
  
  totalFiles++;
  
  // Fix incorrect template literals: '${API_URL}' -> ${API_URL}
  content = content.replace(/'\$\{API_URL\}'/g, '${API_URL}');
  
  // Fix incorrect import placement
  const importPattern = /import\s*\{\s*API_URL\s*\}\s*from\s*['"]@\/lib\/config['"]/;
  const lines = content.split('\n');
  let newLines = [];
  let importAdded = false;
  let importLineIndex = -1;
  
  // First pass: find and extract the import if it exists
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (importPattern.test(line)) {
      if (importLineIndex === -1) {
        importLineIndex = i;
      }
    }
  }
  
  // Second pass: rebuild the file
  if (importLineIndex !== -1) {
    // Remove the incorrectly placed import
    const importLine = lines[importLineIndex].trim();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip the incorrectly placed import
      if (i === importLineIndex && importPattern.test(line)) {
        continue;
      }
      
      // Add import at the beginning (after other imports)
      if (!importAdded && (line.startsWith('import') || line.startsWith('use client') || line.startsWith('"use client"'))) {
        // Add after this line
        newLines.push(line);
        newLines.push(importLine);
        importAdded = true;
      } else if (!importAdded && i === 0) {
        // If no imports found, add at the beginning
        newLines.push(importLine);
        newLines.push(line);
        importAdded = true;
      } else {
        newLines.push(line);
      }
    }
    
    content = newLines.join('\n');
  }
  
  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedFiles++;
    console.log(`Fixed ${relativePath}`);
  }
}

// Process all directories
console.log('Starting API URL fix...\n');
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files fixed: ${updatedFiles}`);