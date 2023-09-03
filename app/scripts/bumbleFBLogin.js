import acceptBumbleCookies from "./acceptBumbleCookies.js";
import { setTimeout } from "timers/promises";

const fblogin = async (page, email, password, retry, firstName) => {
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

    await page.waitForXPath("//span[contains(., 'Continue with Facebook')]")

    // const [facebookLoginButton] = await page.$x('/html/body/div/div/div[1]/div[2]/main/div/div[3]/form/div[1]/div/div[2]/div');
    const [facebookLoginButton] = await page.$x("//span[contains(., 'Facebook')]");

    const newPagePromise = new Promise(x => page.once("popup", x));

    if (facebookLoginButton) {
      await facebookLoginButton.click();
    }
    // await facebookLoginButton.evaluate(b => b.click());

    // await page.waitForXPath(
    //     `//*[@id="modal-manager"]/div/div/div/div/div[3]/span/div[2]/button`
    //     // to get xpath right click on the element > copy > xpath
    // );

    // // select the login button
    // const [FBLoginBtn] = await page.$x(
    //     `//*[@id="modal-manager"]/div/div/div/div/div[3]/span/div[2]/button`
    // );

    // //better way of capturing popup

    // // click the login button
    // await FBLoginBtn.click();
    const popup = await newPagePromise;

    try {
      await setTimeout(5000);
      console.log('clicking page')
      await popup.click(`[aria-label='Continue as ${firstName}']`);
    } catch (err) {
      console.log(err, 'no aria label button for facebook consent 1st try')
    }

    // // wait for email box to open
    await popup.waitForSelector("#email");

    // // click on the input
    await popup.click("#email");
    // // type the username/email in textfeild
    await popup.keyboard.type(email);


    // // click on the password input and type password
    await popup.click("#pass");

    await popup.keyboard.type(password);


    // // wait for login btn to appear and then click on it
    await popup.waitForSelector("#loginbutton");

    await setTimeout(3000);
    await popup.click("#loginbutton");

    try {
      await setTimeout(5000);
      console.log('clicking page')
      await popup.click(`[aria-label='Continue as ${firstName}']`);
    } catch (err) {
      console.log(err, 'no aria label button for facebook consent post login step')
    }

    return true;
  } catch (e) {
    console.log("Facebook login error", e);

    if (retry === true) {
      return fblogin(page, email, password, false);
    }
    return false;
  }
}

export default fblogin;

      // capture the FB login popup
      // const newPagePromise = new Promise(x =>
      //   browser.once("targetcreated", target => x(target.page()))
      // );