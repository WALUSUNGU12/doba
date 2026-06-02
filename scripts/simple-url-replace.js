// Simple URL replacement without import changes
const fs = require('fs');
const path = require('path');

const directories = [
  'app',
  'components',
  'contexts',
];

let totalFiles = 0;
let updatedFiles = 0;

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts'))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Skip if no localhost references
  if (!content.includes('localhost:5000') && !content.includes('127.0.0.1:5000')) {
    return;
  }
  
  totalFiles++;
  
  // Direct replacement - no imports needed
  content = content.replace(/http:\/\/localhost:5000/g, 'http://api-doba.techgenesismw.com');
  content = content.replace(/http:\/\/127\.0\.0\.1:5000/g, 'http://api-doba.techgenesismw.com');
  
  // Remove broken imports from previous attempts
  content = content.replace(/import\s*\{\s*API_URL\s*\}\s*from\s*['"]@\/lib\/config['"]/g, '');
  content = content.replace(/import\s*\{\s*API_URL\s*\}\s*from\s*['"]@\/lib\/config['"][\s\S]*?}/g, '');
  
  // Clean up extra blank lines
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedFiles++;
    console.log(`Updated ${relativePath}`);
  }
}

console.log('Starting simple URL replacement...\n');
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files updated: ${updatedFiles}`);