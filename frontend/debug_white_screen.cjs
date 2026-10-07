const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE_ERROR:', msg.text());
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login');
  
  // Try login
  await page.type('input[type="email"]', 'kader@gmail.com');
  await page.type('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  console.log('Navigated. Current URL:', page.url());
  
  console.log('Navigating to pemeriksaan...');
  await page.goto('http://localhost:5173/kader/pemeriksaan');
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Done.');
  
  await browser.close();
})();
