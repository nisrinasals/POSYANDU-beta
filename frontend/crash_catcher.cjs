const http = require('http');
const server = http.createServer((req, res) => {
  // enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      console.log('\n\n--- REACT CRASH REPORT ---');
      console.log(body);
      console.log('--------------------------\n\n');
      res.writeHead(200);
      res.end('OK');
      process.exit(0); // Exit after receiving error
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(9999, () => {
  console.log('Listening for React crash logs on http://localhost:9999...');
});
