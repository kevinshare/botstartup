import axios from 'axios';

export default async (image) => {
  let captchaId = '';

  try {
    const result = await axios.post(
      'https://captcha-solve.com/api/text',
      {
        raw: image,
        alert: false
      }
    );
    captchaId = result.data.id;

  } catch (e) {
    console.log('Failed to call postCaptcha', console.log(e));
  }

  return {
    captchaId,
  }
}  
