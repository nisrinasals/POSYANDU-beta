import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE_ERROR:', msg.text());
    }
  });

  // Navigate to login just to set origin
  await page.goto('http://localhost:5173/login');
  
  // Set localStorage token
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-token-123');
    localStorage.setItem('user', JSON.stringify({
      id: 1, roleType: 'kader', posyandu_id: 1, posyandu: 'Posyandu Mawar', nama: 'Kader Test'
    }));
  });
  
  // Enable request interception to mock API calls
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('/api/auth/me')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            user: {
              id: 1,
              email: 'kader@gmail.com',
              nama_lengkap: 'Kader Test',
              role: 'kader',
              posyandu_id: 1,
              posyandu: { id: 1, nama_posyandu: 'Posyandu Mawar' }
            }
          }
        })
      });
    } else if (request.url().includes('/api/warga')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] })
      });
    } else if (request.url().includes('/api/pemeriksaan')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] })
      });
    } else if (request.url().includes('/api/posyandu') || request.url().includes('/api/jadwal') || request.url().includes('/api/dashboard')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: {} })
      });
    } else {
      request.continue();
    }
  });

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/kader/dashboard');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking on Pemeriksaan menu...');
  await page.evaluate(() => {
    const menus = Array.from(document.querySelectorAll('a, button, div')).filter(el => el.textContent && el.textContent.includes('Pemeriksaan'));
    if(menus.length > 0) menus[0].click();
  });
  
  console.log('Waiting for crash logs...');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Clicking on Data Sasaran menu...');
  await page.evaluate(() => {
    const menus = Array.from(document.querySelectorAll('a, button, div')).filter(el => el.textContent && el.textContent.includes('Data Sasaran'));
    if(menus.length > 0) menus[0].click();
  });
  
  await new Promise(r => setTimeout(r, 3000));

  console.log('Done.');
  await browser.close();
})();
