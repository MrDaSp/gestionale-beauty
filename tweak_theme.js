const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'webapp/src/app');

function tweakInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Revert buttons with bg-blue-600 to have text-white instead of text-slate-900
  content = content.replace(/bg-blue-600(.*?)text-slate-900/g, 'bg-blue-600$1text-white');
  
  // If there are other buttons or elements where text-white was blindly replaced but they have a solid colored bg
  content = content.replace(/bg-emerald-500(.*?)text-slate-900/g, 'bg-emerald-500$1text-white');
  content = content.replace(/bg-red-600(.*?)text-slate-900/g, 'bg-red-600$1text-white');
  
  // Scatole glass (pannelli) - passiamo da bg-white a bg-white/80 per dare l'effetto opaco
  content = content.replace(/bg-white border/g, 'bg-white/80 border');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Tweaked ${filePath}`);
}

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      tweakInFile(fullPath);
    }
  }
}

walkDir(dir);
console.log('Theme tweak complete!');
