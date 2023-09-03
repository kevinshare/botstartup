export default async (page) => {
    // await page.waitForXPath("//div[@id='notice']")

    try {
        const elementHandle = await page.waitForXPath('//iframe[@title="SP Consent Message"]');
        const frame = await elementHandle.contentFrame();
        // await frame.waitForSelector('[ng-model="vm.username"]');
        // const username = await frame.$('[ng-model="vm.username"]');
        const [acceptCookie] = await frame.$x("/html/body/div/div[2]/div[2]/div[3]/div[3]/button[2]")
        const [acceptCookie2] = await frame.$x("/html/body/div/div[2]/div[2]/div[2]/div/button")

        if (acceptCookie) {
            await acceptCookie.click();
        }

        if (acceptCookie2) {
            await acceptCookie2.click();
        }

        return true;

    } catch (e) {
        console.log('NO COOKIE IFRAME POPUP', e);
        return false;
    }
    // try {
    //     const elementHandle = await page.waitForXPath('//iframe[@title="SP Consent Message"]');
    //     const frame = await elementHandle.contentFrame();
    //     // await frame.waitForSelector('[ng-model="vm.username"]');
    //     // const username = await frame.$('[ng-model="vm.username"]');




    // } catch (e) {
    //     console.log('NO COOKIE IFRAME POPUP', e);
    // }

}