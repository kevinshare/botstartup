export default async (page) => {
    await page.waitForXPath("//button[contains(., 'I accept')]")

    const [acceptCookie] = await page.$x("/html/body/div[1]/div/div[2]/div/div/div[1]/div[1]/button")

    await acceptCookie.click();
}