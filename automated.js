
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

    // Wait until there are no network requests for at least 15000 ms
    await page.waitForNetworkIdle({ timeout: 15000 }); // waits up to 15s

    // Wait for the <p> element containing '絞り込み' and click on it
    await page.evaluate(() => {
        const p = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('絞り込み')
        );
        if (p) {
            p.click();
        }
    });

    // Wait for the <p> element containing '絞り込み' and click on it
    await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select'));
        const targetSelect = selects.find(select =>
            //Array.from(select.options).some(opt => opt.text.trim() === '李　志鵬')
            Array.from(select.options).some(opt => opt.text.trim() === '星野　加奈子')
        );

        if (targetSelect) {
            const targetOption = Array.from(targetSelect.options).find(
                //opt => opt.text.trim() === '李　志鵬'
                opt => opt.text.trim() === '星野　加奈子'
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
            p2.click();
        }
    });

    //Fetch the candidate list by waiting for the top position element to be visible
    await page.waitForSelector('div#top-position', { visible: true });
    // Click the 3rd row
    try {
        // Wait for the 3rd row specifically
        await page.waitForSelector('#top-position > div:nth-child(2)', { visible: true });

        // Click the 6th row
        await page.click('#top-position > div:nth-child(2)');

    } catch (error) {
        console.error('Error clicking sixth row:', error);
    }


    // Wait for the <p> element containing '求人リスト' and click on it
    await page.waitForSelector('#slide-panel-large', { visible: true });
    try {
        const found = await page.evaluate(() => {
            sidePanel = document.querySelector('#slide-panel-large');
            const p3 = Array.from(sidePanel.querySelectorAll('div > div.flex.cursor-pointer.font-bold.text-text-black.bg-custom-mainLight')).find(
                el => el.textContent.trim() == '求人リスト'
            );
            if (p3) {
                p3.scrollIntoView();
                p3.click();
                return true;
            }
            return false;
        });

        if (found) {
            console.log('✅ Clicked the element containing "求人リスト".');
        } else {
            console.log('❌ Could not find element containing "求人リスト".');
        }
    } catch (error) {
        console.error('Error clicking 求人リスト:', error);
    };

    // Wait until there are no network requests for at least 20000 ms
    await page.waitForNetworkIdle({ timeout: 20000 }); // waits up to 20s

    // Wait for the <p> element containing '推薦する' and click on it
    const res = await page.evaluate(() => {
        const pCompanies = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent.includes('推薦する')
        );
        //for (let i = 0; i < length(pCompanies); i++) {
        if (pCompanies) {
            pCompanies.click();
            return pCompanies.textContent;
        } else {
            return 'Not found';
        }
    });

    console.log('Clicked on 推薦する:', res);

    // Wait until there are no network requests for at least 15000 ms
    await page.waitForNetworkIdle({ timeout: 15000 }); // waits up to 15s
    // Wait for the <p> element containing '編集' and click on it
    const p4 = await page.evaluate(() => {
        const edit = Array.from(document.querySelectorAll('p')).find(
            el => el.textContent == '編集'
        );
        if (edit) {
            edit.click();
            return edit.textContent;
        } else {
            return 'Not found';
        }
    });

    console.log('Clicked on 編集:', p4);


    //別途添付資料をご参照
    await page.waitForSelector('#slide-panel-middle', { visible: true });
    try {
        // Focus it
        await page.click('#slide-panel-middle textarea', { clickCount: 3 }); // triple-click selects all text
        // Clear previous text
        await page.keyboard.press('Backspace');
        await page.type('#slide-panel-middle textarea', '別途添付資料をご参照');

        // Focus it
        await page.click('#slide-panel-middle input[placeholder="例）田中一郎：012-1234-5678"]', { clickCount: 3 }); // triple-click selects all text
        // Clear previous text
        await page.keyboard.press('Backspace');
        await page.type('#slide-panel-middle input[placeholder="例）田中一郎：012-1234-5678"]', '080-4910-1030');
        console.log('✅ Filled the textarea with the specified text.');
    } catch (error) {
        console.error('Error locating the textarea:', error);
    }

    //select the ‘自社集客’ option
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
            console.error('Option not found');
        }
    });

    await page.click('#slide-panel-middle input#attachment');

    //select the ‘履歴書_’ option
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#slide-panel-middle #top-position table tr:nth-child(1) td button p'));

        //移除之前的附件
        const prevTargetSelect = buttons.find(
            el => el.text.trim().includes('削除')
        );

        if (prevTargetSelect) {
            prevTargetSelect.click();
        }

        const selects = Array.from(document.querySelectorAll('#slide-panel-middle #top-position table tr:nth-child(1) td select'));

        const targetSelect = selects.find(select =>
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
            if (btn) {
                btn.click();
            }
        } else {
            console.error('Option not found');
        }

        //-----------------------------------------------------------2-------------------------------------------------
        //const buttons2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(2) td button p'));

        ////移除之前的附件
        //const prevTargetSelect2 = buttons2.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('削除'))
        //);

        //if (prevTargetSelect2) {
        //    prevTargetSelect2.click();
        //}

        //const selects2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(1) td select'));

        //const targetSelect2 = selects2.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('職務経歴書_'))
        //);

        //if (targetSelect2) {
        //    const targetOption2 = Array.from(targetSelect2.options).find(
        //        opt => opt.text.trim().includes('職務経歴書_')
        //    );
        //    targetSelect2.value = targetOption2.value;
        //    targetSelect2.dispatchEvent(new Event('change', { bubbles: true }));

        //    const btn2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(2) td button')).find(
        //        el => el.textContent.trim() === '追加'
        //    );
        //    if (btn2) {
        //        btn2.click();
        //    }
        //} else {
        //    console.error('Option not found');
        //}


        ////-----------------------------------------------------------3-------------------------------------------------
        //const buttons3 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td button p'));

        ////移除之前的附件
        //const prevTargetSelect3 = buttons3.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('削除'))
        //);

        //if (prevTargetSelect3) {
        //    prevTargetSelect3.click();
        //}

        //const targetSelect3 = selects3.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('推薦状_'))
        //);

        //if (targetSelect3) {
        //    const targetOption3 = Array.from(targetSelect3.options).find(
        //        opt => opt.text.trim().includes('推薦状_')
        //    );
        //    targetSelect3.value = targetOption.value;
        //    targetSelect3.dispatchEvent(new Event('change', { bubbles: true }));

        //    const btn3 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td button')).find(
        //        el => el.textContent.trim() === '追加'
        //    );
        //    if (btn3) {
        //        btn3.click();
        //    }
        //} else {
        //    console.error('Option not found');
        //}


        //const selects2_1 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(2) td button p'));

        //移除之前的附件
        //const prevTargetSelect2 = selects2_1.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('削除'))
        //);

        //if (prevTargetSelect2) {
        //    prevTargetSelect2.click();
        //}

        //const selects2_2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(2) td select'));

        //const targetSelect2 = selects2_2.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('職務経歴書_'))
        //);

        //if (targetSelect2) {
        //    const targetOption2 = Array.from(targetSelect2.options).find(
        //        opt => opt.text.trim().includes('職務経歴書_')
        //    );
        //    targetSelect2.value = targetOption2.value;
        //    targetSelect2.dispatchEvent(new Event('change', { bubbles: true }));

        //    const btn2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(2) td button')).find(
        //        el => el.textContent === '追加'
        //    );
        //    if (btn2) {
        //        btn2.click();
        //    }
        //} else {
        //    console.error('Option not found');
        //}

        //const selects3_1 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td button p'));

        ////移除之前的附件
        //const prevTargetSelect3 = selects3_1.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('削除'))
        //);

        //if (prevTargetSelect3) {
        //    prevTargetSelect3.click();
        //}

        //const selects3_2 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td select'));

        //const targetSelect3 = selects3_2.find(select =>
        //    Array.from(select.options).some(opt => opt.text.trim().includes('推薦状_'))
        //);

        //if (targetSelect3) {
        //    const targetOption3 = Array.from(targetSelect3.options).find(
        //        opt => opt.text.trim().includes('推薦状_')
        //    );
        //    targetSelect3.value = targetOption3.value;
        //    targetSelect3.dispatchEvent(new Event('change', { bubbles: true }));


        //    const btn3 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td button')).find(
        //        el => el.textContent === '追加'
        //    );
        //    if (btn3) {
        //        btn3.click();
        //    }
        //} else {
        //    console.error('Option not found');
        //}
        //});

        // Wait until there are no network requests for at least 20000 ms
        //await page.waitForNetworkIdle({ timeout: 20000 }); // waits up to 20s

        //await page.evaluate(() => {

        //});


        // Wait until there are no network requests for at least 20000 ms
        //await page.waitForNetworkIdle({ timeout: 20000 }); // waits up to 20s

        //await page.evaluate(() => {
        //    const selects3 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td select'));

        //    //移除之前的附件
        //    const prevTargetSelect3 = selects3.find(select =>
        //        Array.from(select.options).some(opt => opt.text.trim().includes('削除'))
        //    );

        //    if (prevTargetSelect3) {
        //        prevTargetSelect3.click();
        //    }

        //    const targetSelect3 = selects3.find(select =>
        //        Array.from(select.options).some(opt => opt.text.trim().includes('推薦状_'))
        //    );

        //    if (targetSelect3) {
        //        const targetOption3 = Array.from(targetSelect3.options).find(
        //            opt => opt.text.trim().includes('推薦状_')
        //        );
        //        targetSelect3.value = targetOption3.value;
        //        targetSelect3.dispatchEvent(new Event('change', { bubbles: true }));


        //        const btn3 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(3) td button')).find(
        //            el => el.textContent === '追加'
        //        );
        //        if (btn3) {
        //            btn3.click();
        //        }
        //    } else {
        //        console.error('Option not found');
        //    }
        //});


        // Wait until there are no network requests for at least 20000 ms
        //await page.waitForNetworkIdle({ timeout: 20000 }); // waits up to 20s

        //await page.evaluate(() => {
        //    const selects4 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(4) td select'));

        //    //移除之前的附件
        //    const prevTargetSelect4 = selects4.find(select =>
        //        Array.from(select.options).some(opt => opt.text.trim().includes('削除'))
        //    );

        //    if (prevTargetSelect4) {
        //        prevTargetSelect4.click();
        //    }

        //    const targetSelect4 = selects4.find(select =>
        //        Array.from(select.options).some(opt => opt.text.trim().includes('推薦状_'))
        //    );

        //    if (targetSelect4) {
        //        const targetOption4 = Array.from(targetSelect4.options).find(
        //            opt => opt.text.trim().includes('推薦状_')
        //        );
        //        targetSelect4.value = targetOption4.value;
        //        targetSelect4.dispatchEvent(new Event('change', { bubbles: true }));


        //        const btn4 = Array.from(document.querySelectorAll('#slide-panel-middle table tr:nth-child(4) td button')).find(
        //            el => el.textContent === '追加'
        //        );
        //        if (btn4) {
        //            btn4.click();
        //        }
        //    } else {
        //        console.error('Option not found');
        //    }

    });

    //点击保存按钮
    // Wait for the <p> element containing '保存' and click on it
    await page.evaluate(() => {
        const p5 = Array.from(document.querySelectorAll('#slide-panel-middle p')).find(
            el => el.textContent.includes('保存')
        );
        if (p5) {
            p5.click();
        }
    });


    // Wait until there are no network requests for at least 15000 ms
    await page.waitForNetworkIdle({ timeout: 15000 }); // waits up to 15s

    //勾选同意推荐
    await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('span'))
            .find(el => el.textContent.includes('成功報酬について、上記を確認の上、同意して推薦します'));
        if (el) el.closest('label')?.click();
    });

    await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('span'))
            .find(el => el.textContent.includes('候補者許諾保証について、上記対応が完了していることを保証します'));
        if (el) el.closest('label')?.click();
    });

    await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('span'))
            .find(el => el.textContent.includes('HITO-Linkが禁止している求職者情報データベースから取得した求職者情報ではないことを保証します'));
        if (el) el.closest('label')?.click();
    });


    //点击推荐按钮
    // Wait for the <p> element containing 'この内容で推薦する' and click on it
    await page.evaluate(() => {
        const p6 = Array.from(document.querySelectorAll('#top-position p')).find(
            el => el.textContent.includes('この内容で推薦する')
        );
        if (p6) {
            p6.click();
        }
    });

    //确认推荐
    // Wait for the <p> element containing '推薦' and click on it
    const found = await page.evaluate(() => {
        const p7 = Array.from(document.querySelectorAll('body div.mt-7 button p')).find(
            el => el.textContent.includs('推薦')
        );
        if (p7) {
            p7.click();
            return p7.textContent;
        }
    });

    console.log(found);

    //记得每次测试都要登出网站，否则很容易被封账号
    // Wait for the <p> element containing 'IBP株式会社' and click on it
    //await page.evaluate(() => {
    //    const p9 = Array.from(document.querySelectorAll('p')).find(
    //        el => el.textContent.includes('IBP株式会社')
    //    );
    //    if (p9) {
    //        console.log(p9);
    //        p9.click();
    //    }
    //});

    //await page.evaluate(() => {
    //    const p10 = Array.from(document.querySelectorAll('p')).find(
    //        el => el.textContent.includes('ログアウト')
    //    );
    //    if (p10) {
    //        console.log(p10);
    //        p10.click();
    //    }
    //});


    console.log('Logout completed, browser will remain open.');

    // ⬇️ keep browser alive indefinitely
    setInterval(() => { }, 1 << 30);
})();
