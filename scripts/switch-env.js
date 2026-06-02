// Script to switch between development and production environments
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../lib/config.ts');
const mode = process.argv[2] || 'production';

if (!['production', 'development'].includes(mode)) {
  console.error('Invalid mode. Use: production or development');
  process.exit(1);
}

let content = fs.readFileSync(configPath, 'utf8');

// Update the MODE constant
content = content.replace(
  /const MODE = '[^']+'/,
  `const MODE = '${mode}'`
);

fs.writeFileSync(configPath, content, 'utf8');

console.log(`Switched to ${mode} mode`);
console.log(`API URL: ${mode === 'production' ? 'http://api-doba.techgenesismw.com' : 'http://localhost:5000'}`);
console.log(`APP URL: ${mode === 'production' ? 'https://dobadoba.techgenesismw.com' : 'http://localhost:3000'}`);