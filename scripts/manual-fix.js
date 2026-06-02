// Manual fix for API URL replacements - proper approach
const fs = require('fs');
const path = require('path');

const directories = [
  'app',
  'components',
  'contexts',
  'lib',
  'hooks'
];

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
  
  // Skip if no API URL usage
  if (!content.includes('API_URL')) {
    return;
  }
  
  totalFiles++;
  
  // Remove broken import lines
  content = content.replace(/import\s*\{\s*API_URL\s*\}\s*from\s*['"]@\/lib\/config['"][\s\S]*?}/g, '');
  content = content.replace(/import\s*\{\s*API_URL\s*\}\s*from\s*['"]@\/lib\/config['"]/g, '');
  
  // Fix broken template literals
  content = content.replace(/'\$\{API_URL\}'/g, '${API_URL}');
  
  // Add proper import at the top after 'use client' or first import
  const importStatement = "import { API_URL } from '@/lib/config'";
  const useClientPattern = /(['"])use client\1/;
  const importPattern = /^import\s+/;
  
  const lines = content.split('\n');
  let newLines = [];
  let importAdded = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!importAdded) {
      if (useClientPattern.test(trimmedLine)) {
        newLines.push(line);
        newLines.push(importStatement);
        importAdded = true;
      } else if (importPattern.test(trimmedLine)) {
        // Add import before the first import
        newLines.push(importStatement);
        newLines.push(line);
        importAdded = true;
      } else if (i === 0) {
        // First line and no use client or import found
        newLines.push(importStatement);
        newLines.push(line);
        importAdded = true;
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  content = newLines.join('\n');
  
  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedFiles++;
    console.log(`Fixed ${relativePath}`);
  }
}

console.log('Starting manual API URL fix...\n');
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files fixed: ${updatedFiles}`);