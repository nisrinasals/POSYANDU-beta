const fs = require('fs');
const babel = require('@babel/core');

const code = fs.readFileSync('src/pages/kader/PemeriksaanPage.jsx', 'utf8');

babel.transformSync(code, {
  filename: 'PemeriksaanPage.jsx',
  presets: ['@babel/preset-react'],
  plugins: [
    function() {
      return {
        visitor: {
          Identifier(path) {
            if (path.node.name === 'warga' && path.isReferencedIdentifier()) {
              if (!path.scope.hasBinding('warga')) {
                console.log(`warga is not defined at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`);
              }
            }
          }
        }
      };
    }
  ]
});
