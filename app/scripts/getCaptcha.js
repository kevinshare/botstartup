import { setTimeout } from "timers/promises";
import axios from 'axios';

export default async (captchaId) => {
  let solved = false;
  let failed = false;
  let answer = undefined;

  while (solved === false && failed === false) {
    await setTimeout(20000);
    try {
      const result = await axios.get(
        `https://captcha-solve.com/api/text/${captchaId}`
      );
      if (result.data && result.data.solved) {
        answer = result.data.solution.text;
        solved = result.data.solved;
      }

    } catch (e) {
      console.log('Failed to call getCaptcha', console.log(e));
      failed = true;
    }
  }

  return {
    solved,
    answer,
  }
}  
