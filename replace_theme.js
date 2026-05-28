const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'webapp/src/app');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Theme replacements (Dark to Soft Light)
  content = content.replace(/text-white/g, 'text-slate-900');
  content = content.replace(/bg-slate-950/g, 'bg-slate-50');
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-slate-800/g, 'bg-slate-100');
  content = content.replace(/bg-slate-700/g, 'bg-slate-200');
  content = content.replace(/border-slate-800/g, 'border-slate-200');
  content = content.replace(/border-slate-700/g, 'border-slate-300');
  content = content.replace(/text-slate-400/g, 'text-slate-500');
  content = content.replace(/text-slate-300/g, 'text-slate-600');
  content = content.replace(/text-slate-200/g, 'text-slate-700');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(dir);
console.log('Theme replacement complete!');
