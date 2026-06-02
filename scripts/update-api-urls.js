// Script to update all frontend files to use centralized API configuration
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

// Files to skip (already updated or special cases)
const skipFiles = [
  'lib/config.ts',
  'lib/api.ts',
  'contexts/AuthContext.tsx'
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
  
  // Skip files that are already updated or special cases
  if (skipFiles.includes(relativePath)) {
    console.log(`Skipping ${relativePath} (already updated)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if file contains localhost references
  if (!content.includes('http://localhost:5000') && !content.includes('http://127.0.0.1:5000')) {
    return;
  }
  
  totalFiles++;
  
  // Add import if not present
  const importRegex = /import\s+.*\s+from\s+['"]@\/lib\/config['"]/;
  if (!importRegex.test(content)) {
    // Add import after the existing imports
    const importInsertion = content.indexOf('import');
    if (importInsertion !== -1) {
      const lastImportEnd = content.lastIndexOf(';') + 1;
      content = content.slice(0, lastImportEnd) + `\nimport { API_URL } from '@/lib/config'` + content.slice(lastImportEnd);
    }
  }
  
  // Replace localhost references
  content = content.replace(/http:\/\/localhost:5000/g, '${API_URL}');
  content = content.replace(/http:\/\/127\.0\.0\.1:5000/g, '${API_URL}');
  
  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedFiles++;
    console.log(`Updated ${relativePath}`);
  }
}

// Process all directories
console.log('Starting API URL update...\n');
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files updated: ${updatedFiles}`);
console.log(`Files skipped: ${skipFiles.length}`);