const possibleMatches = [
  'yes',
  'i did',
  'ok',
  'i added you',
  'added you',
  'followed you',
  'did you see it',
  'gotchu',
  'ill add',
  'ill add you there',
  'sounds good',
  'for sure',
  'followed',
  'sure',
  'ill see you there',
  'look forward to it',
  'amazing',
  'check for',
  'perfect',
  'add',
  'added ya',
  'followed',
  'added',
  'sent',
  'texted',
  'i texted',
  'txted',
  'requested',
  'a request',
  'got u',
  'got you',
  'cool',
  'ya',
  '100%',
  'yeah',
  'yeah sure',
  'just messaged you',
  'messaged you',
  'messaged you there'
]

export default (lastMessages) => {
  let isAConfirmation = false;
  lastMessages.forEach(element => {
    possibleMatches.forEach(match => {
      if (
        element['mssg']
        && element['mssg'].toLowerCase().includes(match)
        && !isAConfirmation
      ) {
        isAConfirmation = true;
      }
    })
  });

  return isAConfirmation;
}