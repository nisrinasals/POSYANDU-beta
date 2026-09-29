const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = getFiles('src/pages');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Regex to match the pagination div container
  const regex = /(<div className="d-flex align-items-center gap-1">[\s\S]*?<ChevronLeft[\s\S]*?Array\.from[\s\S]*?<ChevronRight[\s\S]*?<\/div>)/g;
  
  content = content.replace(regex, (match) => {
    // Avoid double wrapping
    if (originalContent.includes('{totalPages > 1 && (\n            ' + match) || originalContent.includes('{totalPages > 1 && (' + match)) {
      return match;
    }
    
    // Check if it's already wrapped in some conditional logic with totalPages
    const indexBeforeMatch = originalContent.indexOf(match) - 20;
    if (indexBeforeMatch >= 0 && originalContent.slice(indexBeforeMatch, indexBeforeMatch + 20).includes('{totalPages > 1 &&')) {
      return match;
    }

    return '{totalPages > 1 && (\n            ' + match.split('\n').join('\n            ') + '\n          )}';
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log('Modified ' + file);
  }
});
console.log('Total files modified: ' + modifiedCount);
