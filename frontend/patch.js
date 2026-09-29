const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./src/pages');

let filesChanged = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Pattern 1: <ul className="pagination ...
  if (content.includes('<ul className="pagination') || content.includes('Menampilkan') || content.includes('<li className="page-item disabled">')) {
    // Some files might already be fixed, or have a simple pagination.
    // I need to add dynamic pagination logic in RekapPemeriksaanPage.jsx and PuskesmasRekapitulasiPage.jsx.
    // Let's print out what files have it.
    if(content.includes('<ul className="pagination')) {
        console.log("File with hardcoded pagination:", file);
    }
  }
});
