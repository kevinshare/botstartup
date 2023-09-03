import { setTimeout } from "timers/promises";
import acceptBumbleCookies from "./acceptBumbleCookies.js";

const phoneLogin = async (page, phone, retry) => {
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

    await page.waitForXPath("//span[contains(., 'Use cell phone number')]")

    const [phoneLoginButton] = await page.$x('/html/body/div/div/div[1]/div[2]/main/div/div[3]/form/div[3]/div');

    // const newPagePromise = new Promise(x => page.once("popup", x));

    await phoneLoginButton.evaluate(b => b.click());


    await page.type('#phone', phone);
    await setTimeout(2000);


    const [sendButton] = await page.$x('/html/body/div/div/div[1]/div[2]/main/div/div[3]/form/div[4]/button');
    await sendButton.evaluate(b => b.click());

    // //better way of capturing popup


  } catch (e) {
    console.log("Phone login error", e);
    if (retry === true) {
      return phoneLogin(page, phone, false);
    }
    return false;
  }
}

export default phoneLogin;
