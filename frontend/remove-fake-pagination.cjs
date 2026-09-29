const fs = require('fs');

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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  if (!content.includes('totalPages') && !content.includes('currentPage') && content.includes('<ChevronLeft')) {
    const regex = /(<div className="d-flex align-items-center gap-1">[\s\S]*?<ChevronLeft[\s\S]*?<\/div>)/g;
    content = content.replace(regex, '');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Removed fake pagination from ' + file);
  }
});
