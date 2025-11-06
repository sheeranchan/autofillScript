
SET UP

The settings is set upon WSL2 Ubuntu on Windows 11.

0. Set up your WSL2: https://learn.microsoft.com/en-us/windows/wsl/install ;
1. Install nodejs, you will need to then install a package called puppeteer: **npm install puppeteer**;
2. **sudo apt update && sudo apt install -y chromium-browser chromium-chromedriver**;
3. **npx @puppeteer/browsers install chromium@latest**
4. Replace your email & pwd with these 2 lines
await page.type('#email', '<your real email here>');
await page.type('#password', '<your real password here>');
5. Run the JS script by: **node automated.js** ;
6. By the time you use the script, you may use a different chromium version, you may also need to replace these 2 parameters - userDataDir & executablePath:
  const browser = await puppeteer.launch({
  	headless: false,
  	userDataDir: '/home/schen/puppeteer_tmp', 
  	executablePath: '/home/schen/chrome/linux-<your local IP>/chrome-linux<your local version>/chrome',
  	args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
