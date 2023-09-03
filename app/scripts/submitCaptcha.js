import { setTimeout } from "timers/promises";

export default async (page, answer) => {
  try {
    console.log(answer);
    await page.type('.text-field__input', answer);
    await setTimeout(2000);


    const [sendButton] = await page.$x('/html/body/div/div/div[1]/div[2]/main/div/div[4]/form/div[2]/button');
    await sendButton.evaluate(b => b.click());

    return true;
  } catch (e) {
    console.log('Couldnt get captch submit fields: ', e);
    return false;
  }

}