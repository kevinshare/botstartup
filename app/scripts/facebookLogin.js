import { setTimeout } from "timers/promises";
import acceptBumbleCookies from "./acceptBumbleCookies.js";


export default async (page, email, password, retry) => {
    try {
        // wait for phone login button to appear
        await setTimeout(2000);
        //const [loginButton] = await page.$x('/html/body/div[2]/div/div/div[1]/div/div[2]/div/div[2]/div/div[2]/div[1]/div/div[2]/a');
        const loginButton = await page.$('a.button.button--block.button--secondary.js-event-link');
        console.log(loginButton);

        await loginButton.click();

        try {
            await acceptBumbleCookies(page);
        } catch (e) {
            console.log(e);
        }


        await page.waitForXPath("//button[contains(., 'Log in with Facebook')]")

        const [facebookLoginButton] = await page.$x('/html/body/div[2]/main/div/div[1]/div/div/div[3]/span/div[2]/button');

        const newPagePromise = new Promise(x => page.once("popup", x));

        await facebookLoginButton.evaluate(b => b.click());

        // //better way of capturing popup

        // // click the login button
        // await FBLoginBtn.click();
        const popup = await newPagePromise;

        // // wait for email box to open
        await popup.waitForSelector("#email");

        // // click on the input
        await popup.click("#email");
        // // type the username/email in textfeild

        await setTimeout(async () => {
            return await popup.keyboard.type(email);
        }, 3000)


        // // click on the password input and type password
        await popup.click("#pass");

        await setTimeout(async () => {
            return await popup.keyboard.type(password);
        }, 4000)


        // // wait for login btn to appear and then click on it
        await popup.waitForSelector("#loginbutton");

        await setTimeout(async () => {
            return await popup.click("#loginbutton");
            // // wait for the swipe card to appear
        }, 7000)

        return true;
    } catch (e) {
        console.log("Facebook login error", e);

        return false;
    }
}

        // capture the FB login popup
        // const newPagePromise = new Promise(x =>
        //   browser.once("targetcreated", target => x(target.page()))
        // );