import { setTimeout } from "timers/promises";

export default async (page) => {
  await setTimeout(3000);
  try {
    const captchas = await page.$$eval(
      ".captcha__image",
      el => el.map(item => item.getAttribute("src"))
    );

    console.log(captchas);

    console.log(captchas[0]);
    return true;
  } catch (e) {
    console.log('Couldnt do the captchaaa', e);
    return false;
  }
}