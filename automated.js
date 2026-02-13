const puppeteer = require('puppeteer');

// Helper function to wait/delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: '/home/schen/puppeteer_tmp',
        executablePath: '/home/schen/chrome/linux-145.0.7632.67/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        await page.goto('https://agent.hito-link.jp/login', { waitUntil: 'networkidle0' });
    } catch (error) {
        console.log('did not land on login page initially');
    }

    // If you failed the script before and in that session, the user already logged in
    // We will need to skip the login steps
    const isLoggedIn = await page.$eval('body', body =>
        body.innerText.includes('李　志鵬')
    ).catch(() => false);

    if (!isLoggedIn) {
        await page.goto('https://agent.hito-link.jp/login', { waitUntil: 'networkidle0' });
        await page.goto('https://agent.hito-link.jp/oauth2/authorization/agt', {
            waitUntil: 'networkidle2'
        });

        await page.evaluate(() => {
            const preLoginBtn = Array.from(document.querySelectorAll('a')).find(
                el => el.textContent.includes('ログイン')
            );
            if (preLoginBtn) {
                preLoginBtn.click();
            }
        });

        await page.waitForSelector('#email', { visible: true });
        await page.type('#email', '<your username>');
        await page.type('#password', '<your password>');
        await page.click('#next');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
        console.log('INFO >>> Existing session detected. Login skipped.');
    }

    await page.waitForNetworkIdle({ timeout: 30000 });

    // Fetch the candidate list by waiting for the top position element to be visible
    await page.waitForSelector('div#top-position', { visible: true });

    // Click the 4th row
    try {
        await page.waitForSelector('#top-position > div:nth-child(4)', { visible: true });
        await page.click('#top-position > div:nth-child(4)');
    } catch (error) {
        console.error('Error >>> clicking required row:', error);
    }

    // Wait for the side panel and click on '求人リスト'
    await page.waitForSelector('#slide-panel-large', { visible: true });
    try {
        const found = await page.evaluate(() => {
            const sidePanel = document.querySelector('#slide-panel-large');
            const p3 = Array.from(sidePanel.querySelectorAll('div > div.flex.cursor-pointer.font-bold.text-text-black.bg-custom-mainLight')).find(
                el => el.textContent.trim() === '求人リスト'
            );
            if (p3) {
                p3.scrollIntoView();
                p3.click();
                return true;
            }
            return false;
        });

        if (found) {
            console.log('INFO >>> ✅ Clicked the element containing "求人リスト".');
        } else {
            console.log('INFO >>> ❌ Could not find element containing "求人リスト".');
        }
    } catch (error) {
        console.error('Error >>> clicking 求人リスト:', error);
    }

    await page.waitForNetworkIdle({ timeout: 60000 });

    // Process all 推薦する buttons
    let processedCount = 0;

    while (true) {
        // Wait for the top position to be visible
        await page.waitForSelector('#top-position', { visible: true });

        // Find all 推薦する buttons
        const recommendButtons = await page.$$('button:has-text("推薦する")').catch(async () => {
            // Fallback: use evaluate to find buttons
            return await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button')).filter(
                    btn => btn.textContent.includes('推薦する')
                );
                return buttons.length;
            });
        });

        // Alternative approach using evaluate to get button count
        const buttonCount = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('button')).filter(
                btn => btn.textContent.includes('推薦する')
            ).length;
        });

        console.log(`INFO >>> Found ${buttonCount} 推薦する button(s)`);

        if (buttonCount === 0) {
            console.log('✅ No more 推薦する buttons found. All jobs processed.');
            break;
        }

        // Click the first available button
        const clicked = await page.evaluate(() => {
            const button = Array.from(document.querySelectorAll('button')).find(
                btn => btn.textContent.includes('推薦する')
            );
            if (button) {
                button.click();
                return true;
            }
            return false;
        });

        if (!clicked) {
            console.log('❌ Could not click 推薦する button');
            break;
        }

        console.log(`INFO >>> Clicked on 推薦する button #${processedCount + 1}`);
        await page.waitForNetworkIdle({ timeout: 60000 });

        // Wait for the middle panel and click on '編集'
        await page.waitForSelector('#slide-panel-middle', { visible: true });
        const p4 = await page.evaluate(() => {
            const edit = Array.from(document.querySelectorAll('p')).find(
                el => el.textContent === '編集'
            );
            if (edit) {
                edit.click();
                return edit.textContent;
            }
            return 'Not found';
        });

        console.log('INFO >>> Clicked on 編集:', p4);

        // Fill in the form
        await page.waitForSelector('#slide-panel-middle', { visible: true });
        try {
            // Fill textarea
            await page.click('#slide-panel-middle textarea', { clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.type('#slide-panel-middle textarea', '別途添付資料をご参照');

            // Fill phone number
            await page.click('#slide-panel-middle input[placeholder="例）田中一郎：012-1234-5678"]', { clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.type('#slide-panel-middle input[placeholder="例）田中一郎：012-1234-5678"]', '080-4910-1030');

            console.log('✅ Filled the textarea and phone number with the specified text.');
        } catch (error) {
            console.error('Error filling form fields:', error);
        }

        // Select '自社集客' option
        await page.evaluate(() => {
            const selects = Array.from(document.querySelectorAll('#slide-panel-middle select'));
            const targetSelect = selects.find(select =>
                Array.from(select.options).some(opt => opt.text.trim() === '自社集客')
            );

            if (targetSelect) {
                const targetOption = Array.from(targetSelect.options).find(
                    opt => opt.text.trim() === '自社集客'
                );
                targetSelect.value = targetOption.value;
                targetSelect.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.error('Error >>> 自社集客 option not found');
            }
        });

        await page.waitForNetworkIdle({ timeout: 20000 });
        await page.click('#slide-panel-middle input#attachment');

        // Click attachment checkbox
        try {
            await page.evaluate(() => {
                const el = Array.from(document.querySelectorAll('span'))
                    .find(el => el.textContent.includes('添付ファイル'));
                if (el) el.closest('label')?.click();
            });
        } catch (error) {
            console.log('Error >>> Attachment upload box was not ticked successfully.');
        }

        // Add first attachment (履歴書_)
        try {
            await page.evaluate(() => {
                const select = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(1) td select'));
                const targetSelect = select.find(select =>
                    Array.from(select.options).some(opt => opt.text.trim().includes('履歴書_'))
                );

                if (targetSelect) {
                    const targetOption = Array.from(targetSelect.options).find(
                        opt => opt.text.trim().includes('履歴書_')
                    );
                    targetSelect.value = targetOption.value;
                    targetSelect.dispatchEvent(new Event('change', { bubbles: true }));

                    const btn = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(1) td button')).find(
                        el => el.textContent.trim() === '追加'
                    );
                    if (btn) btn.click();
                } else {
                    console.error('Error >>> 履歴書_ option not found');
                }
            });
            console.log('✅ Added first attachment (履歴書_)');
        } catch (error) {
            console.log('Error >>> 1st attachment is not done.');
        }

        await page.waitForNetworkIdle({ timeout: 60000 });

        // Add second attachment (職務経歴書_)
        try {
            await page.evaluate(() => {
                const select2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td select'));
                const targetSelect2 = select2.find(select2 =>
                    Array.from(select2.options).some(opt => opt.text.trim().includes('職務経歴書_'))
                );

                if (targetSelect2) {
                    const targetOption2 = Array.from(targetSelect2.options).find(
                        opt2 => opt2.text.trim().includes('職務経歴書_')
                    );
                    targetSelect2.value = targetOption2.value;
                    targetSelect2.dispatchEvent(new Event('change', { bubbles: true }));

                    const btn2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td button')).find(
                        el2 => el2.textContent === '追加'
                    );
                    if (btn2) btn2.click();
                } else {
                    console.error('Error >>> 職務経歴書_ option not found');
                }
            });
            console.log('✅ Added second attachment (職務経歴書_)');
        } catch (error) {
            console.log('Error >>> 2nd attachment is not done.');
        }

        await page.waitForNetworkIdle({ timeout: 60000 });

        // Add third attachment (推薦状_)
        try {
            await page.evaluate(() => {
                const select3 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(5) td select'));
                const targetSelect3 = select3.find(select3 =>
                    Array.from(select3.options).some(opt3 => opt3.text.trim().includes('推薦状_'))
                );

                if (targetSelect3) {
                    const targetOption3 = Array.from(targetSelect3.options).find(
                        opt => opt.text.trim().includes('推薦状_')
                    );
                    targetSelect3.value = targetOption3.value;
                    targetSelect3.dispatchEvent(new Event('change', { bubbles: true }));

                    const btn3 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(5) td button')).find(
                        el3 => el3.textContent === '追加'
                    );
                    if (btn3) btn3.click();
                } else {
                    console.error('Error >>> 推薦状_ option not found');
                }
            });
            console.log('✅ Added third attachment (推薦状_)');
        } catch (error) {
            console.log('Error >>> 3rd attachment is not done.');
        }

        await page.waitForNetworkIdle({ timeout: 60000 });

        // Click save button (保存)
        await page.evaluate(() => {
            const p5 = Array.from(document.querySelectorAll('#slide-panel-middle p')).find(
                el => el.textContent.includes('保存')
            );
            if (p5) p5.click();
        });

        console.log('INFO >>> Clicked on 保存 (Save)');
        await page.waitForNetworkIdle({ timeout: 15000 });

        // Check all three agreement checkboxes
        await page.evaluate(() => {
            const checkboxes = [
                '成功報酬について、上記を確認の上、同意して推薦します',
                '候補者許諾保証について、上記対応が完了していることを保証します',
                'HITO-Linkが禁止している求職者情報データベースから取得した求職者情報ではないことを保証します'
            ];

            checkboxes.forEach(text => {
                const el = Array.from(document.querySelectorAll('span'))
                    .find(el => el.textContent.includes(text));
                if (el) {
                    el.closest('label')?.click();
                    console.log(`INFO >>> Checked: ${text}`);
                }
            });
        });

        // Click final recommendation button (この内容で推薦する)
        await page.evaluate(() => {
            const p6 = Array.from(document.querySelectorAll('#top-position p')).find(
                el => el.textContent.includes('この内容で推薦する')
            );
            if (p6) p6.click();
        });

        console.log('INFO >>> Clicked on この内容で推薦する');
        await page.waitForNetworkIdle({ timeout: 60000 });

        // Confirm recommendation (推薦)
        const confirmed = await page.evaluate(() => {
            const p7 = Array.from(document.querySelectorAll('body div.mt-7 button p')).find(
                el => el.textContent.includes('推薦')
            );
            if (p7) {
                p7.click();
                return true;
            }
            return false;
        });

        if (confirmed) {
            console.log(`INFO >>> ✅ Clicked on 推薦 button, job #${processedCount + 1} completed`);
        }

        // Wait for confirmation modal to close
        try {
            await page.waitForFunction(() => {
                return !document.body.innerText.includes('入力した内容を、採用企業に送信しますか？');
            }, { timeout: 20000 });
            console.log('✅ Confirmation modal closed.');
        } catch (error) {
            console.log('Warning: Confirmation modal timeout, continuing...');
        }

        processedCount++;
        console.log(`INFO >>> Recommendation process completed. Total processed: ${processedCount}`);
        console.log('INFO >>> Moving to the next one if exists...\n');

        // Small delay before checking for next button
        await delay(2000);
    }

    console.log(`\n========================================`);
    console.log(`✅ All recommendations completed!`);
    console.log(`Total jobs processed: ${processedCount}`);
    console.log(`========================================\n`);

    // Logout
    console.log('INFO >>> Starting logout process...');

    await page.evaluate(() => {
        const p9 = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('IBP株式会社')
        );
        if (p9) {
            console.log('Clicking IBP株式会社');
            p9.click();
        }
    });

    await delay(1000);

    await page.evaluate(() => {
        const p10 = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('ログアウト')
        );
        if (p10) {
            console.log('Clicking ログアウト');
            p10.click();
        }
    });

    console.log('✅ Logout completed, browser will remain open.');

    // Keep browser alive indefinitely
    setInterval(() => { }, 1 << 30);
})();