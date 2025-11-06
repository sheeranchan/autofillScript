const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: '/home/schen/puppeteer_tmp',
    executablePath: '/home/schen/chrome/linux-144.0.7512.1/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

    const page = await browser.newPage();

    await page.goto('https://agent.hito-link.jp/login', { waitUntil: 'networkidle0' });
    await page.click('a[href="https://agent.hito-link.jp/oauth2/authorization/agt"]', { visible: true });
    await page.waitForNavigation();

    await page.waitForSelector('#email', { visible: true });
    await page.type('#email', '<your email>');
    await page.type('#password', '<your pwd>');
    await page.click('#next');
    await page.waitForNavigation();

    // Wait until there are no network requests for at least 10000 ms
    await page.waitForNetworkIdle({ timeout: 10000 }); // waits up to 10s

    // Wait for the <p> element containing '絞り込み' and click on it
    await page.evaluate(() => {
        const p = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('絞り込み')
        );
        if (p) {
            console.log(p);
            p.click();
        }
    });

    // Wait for the <p> element containing '絞り込み' and click on it
    await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select'));
        const targetSelect = selects.find(select =>
            Array.from(select.options).some(opt => opt.text.trim() === '李　志鵬')
        );

        if (targetSelect) {
            const targetOption = Array.from(targetSelect.options).find(
                opt => opt.text.trim() === '李　志鵬'
            );
            targetSelect.value = targetOption.value;
            targetSelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            console.error('Option not found');
        }
    });

    // Wait for the <p> element containing '適用' and click on it
    await page.evaluate(() => {
        const p2 = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('適用')
        );
        if (p2) {
            console.log(p2);
            p2.click();
        }
    });

    //Fetch the candidate list by waiting for the top position element to be visible
    await page.waitForSelector('div#top-position', { visible: true });
    // Click the 3rd row
    try {
        // Wait for the 3rd row specifically
        await page.waitForSelector('#top-position > div:nth-child(3)', { visible: true });

        // Click the 3rd row
        await page.click('#top-position > div:nth-child(3)');
        
    } catch (error) {
        console.error('Error clicking third row:', error);
    }

    // Wait for the <p> element containing '求人リスト' and click on it
    await page.evaluate(() => {
        const p3 = Array.from(document.querySelectorAll('div')).find(
            el => el.textContent.includes('求人リスト')
        );
        if (p3) {
            console.log(p3);
            p3.click();
        }
    });

    //记得每次测试都要登出网站，否则很容易被封账号
    // Wait for the <p> element containing 'IBP株式会社' and click on it
    await page.evaluate(() => {
        const p9 = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('IBP株式会社')
        );
        if (p9) {
            console.log(p9);
            p9.click();
        }
    });

    await page.evaluate(() => {
        const p10 = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('ログアウト')
        );
        if (p10) {
            console.log(p10);
            p10.click();
        }
    });

  //console.log('Logout completed, browser will remain open.');

  // ⬇️ keep browser alive indefinitely
  setInterval(() => {}, 1 << 30);
})();
