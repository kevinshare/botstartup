import { setTimeout } from "timers/promises";
import axios from 'axios';
export default async (page, name) => {
  await setTimeout(30000);
  try {

    const banWrapper = await page.$('.page-blocker__content', { timeout: 5000 });
    console.log('Banned', banWrapper);

    if (banWrapper !== null) {
      await axios.post(
        'https://us-central1-simpbot-bf277.cloudfunctions.net/alert',
        {
          text: `${name} had an account ban. Hijue puta! Una lastima!`,
          password: "mommymilkers"
        }
      );
      return true;
    } else {
      console.log('No Ban We chillin.');
      return false;
    }



  } catch (e) {
    console.log('No Ban We chillin.', console.log(e));
    return false;
  }
}  
