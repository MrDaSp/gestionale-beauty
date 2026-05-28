const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'webapp/src/app');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace blue with green for the beauty theme
  content = content.replace(/bg-blue-/g, 'bg-emerald-');
  content = content.replace(/text-blue-/g, 'text-emerald-');
  content = content.replace(/border-blue-/g, 'border-emerald-');
  content = content.replace(/ring-blue-/g, 'ring-emerald-');
  content = content.replace(/hover:bg-blue-/g, 'hover:bg-emerald-');
  content = content.replace(/hover:text-blue-/g, 'hover:text-emerald-');
  content = content.replace(/hover:border-blue-/g, 'hover:border-emerald-');

  // Any dikast references might remain, but user mostly asked for "tab verdi"
  // If there are specific "tab" classes, they'll likely use text-emerald-600 or bg-emerald-500 now.
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(dir);
console.log('Beauty theme colors applied!');
