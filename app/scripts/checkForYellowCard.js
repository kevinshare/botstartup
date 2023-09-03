import { setTimeout } from "timers/promises";

export default async (page) => {
  await setTimeout(10000);
  try {

    const [sendButton] = await page.$x('/html/body/div/div/div[1]/div[1]/div/main/section/div/div[3]/div');

    await sendButton.click();


  } catch (e) {
    console.log('No "I understand" Button Yellow Card BS. We chillin.');
    return false;
  }
}  
