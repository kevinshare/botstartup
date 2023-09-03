import { setTimeout } from "timers/promises";
import fs from "fs";
import acceptBumbleCookies from "./acceptBumbleCookies.js"
import bumbleFBLogin from "./bumbleFBLogin.js";
import applyCoordinates from "./applyCoordinates.js";
import phoneLogin from "./phoneLogin.js";
import imNotABot from "./imNotABot.js";
import screenshotElement from "./screenshotElement.js";
import postCaptcha from "./postCaptcha.js";
import getCaptcha from "./getCaptcha.js";
import submitCaptcha from "./submitCaptcha.js";


export default async (
  puppeteer,
  id,
  firstName,
  loginPhone,
  email,
  password,
  currentLocation,
  enableBackgroundMode,
  enablePhoneLogin,
  enableFacebookLogin
) => {

  console.log(`Running bumble bot for ${email}`);

  try {
    fs.unlinkSync(`%userprofile%\\AppData\\Local\\Chromium\\User Data\\${id}/Default/Preferences`);
    console.log("File removed:");
  } catch (err) {
    console.error(err);
  }

  //set headless to false if you want to see the chrome
  const browser = await puppeteer.launch({
    headless: enableBackgroundMode,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--window-size=1920,1080",
      `--user-data-dir=%userprofile%\\AppData\\Local\\Chromium\\User Data\\${id}`,
      `--use-fake-device-for-media-stream`,
      `--use-fake-ui-for-media-stream`,
      `--no-sandbox`,
      `--use-file-for-fake-video-capture=/app/images/IMG_1474.JPG`,
      // '--single-process', '--no-zygote', '--no-sandbox',
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });
  // create browser context
  const context = await browser.createIncognitoBrowserContext();

  // allow location permission for bumble.com
  await context.overridePermissions("https://bumble.com", ["geolocation"]);

  // open a new tab
  const page = await browser.newPage();
  // fix the size of window
  // await page.send("Emulation.clearDeviceMetricsOverride");
  await page.setViewport({
    width: 1800,
    height: 980,
  })



  await page.goto("https://bumble.com", {
    waitUntil: "load",
  });


  try {
    await acceptBumbleCookies(page);
  } catch (e) {
    console.log('No cookie before sign in', e);
  }

  console.log("-- Cookies Accepted --");

  await applyCoordinates(
    page,
    currentLocation.latitude,
    currentLocation.longitude
  );

  console.log(`-- Applied location to lat: ${currentLocation.latitude} and long: ${currentLocation.longitude} --`);


  if (enableFacebookLogin) {
    await bumbleFBLogin(page, email, password, true, firstName);
  }

  if (enablePhoneLogin) {
    await phoneLogin(page, loginPhone, true);
    await imNotABot(page);
  }


  await setTimeout(10000);


  const imageToSend = await screenshotElement(page, '.captcha__image');

  if (imageToSend) {
    const { captchaId } = await postCaptcha(imageToSend);
    const { solved, answer } = await getCaptcha(captchaId);
    console.log(solved, answer);

    if (solved) {
      console.log('Captcha Solved.')
      await submitCaptcha(page, answer);
      if (enableFacebookLogin) {
        await bumbleFBLogin(page, email, password, true, firstName);
      }

      if (enablePhoneLogin) {
        await phoneLogin(page, loginPhone, true);
      }

    } else {
      console.log('Got Captcha Solved as False. Stuck at captcha submit page.')
    }

  }


  console.log('-- Login Activated --');

  return {
    page,
    browser,
  };
}
