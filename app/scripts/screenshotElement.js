import { setTimeout } from "timers/promises";

export default async (page, elementName) => {
  await setTimeout(30000);
  try {
    const capturedElement = await page.$(elementName);

    if (capturedElement) {
      const file = await capturedElement.screenshot({ encoding: 'base64' });

      return file;
    }
  } catch (e) {
    console.log('Couldnt do the screenshot', e);
    return false;
  }
}