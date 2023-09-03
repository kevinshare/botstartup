import Fuse from 'fuse.js'
import axios from 'axios';

export default async (incomingMessage, messagesAndResponses, evalAIOnly, ig) => {
  let messageToRespond = {
    response1: null,
    response2: null,
    waitTime1: null,
    waitTime2: null,
  };
  let isAIResponse = false;

  for (let key in messagesAndResponses) {
    // CHECK .INCLUDES()
    if (
      evalAIOnly === false
      && messagesAndResponses[key]
      && messagesAndResponses[key].possibleMessages
    ) {
      messagesAndResponses[key].possibleMessages.forEach(message => {
        if (
          incomingMessage
          && incomingMessage.toLowerCase().includes(message.toLowerCase())
          && messageToRespond.response1 === null
        ) {
          console.log(' -- Found Existing Chat Scenario -- ')
          messageToRespond = messagesAndResponses[key].responses;

          if (key === 'whatsYourNumberResponse') {
            messageToRespond.response1 = `${messageToRespond.response1} ${ig}`;
          }

          if (key === 'whatsYourSnapResponse') {
            messageToRespond.response1 = `${messageToRespond.response1} ${ig}`;
          }
        }
      })
    }

    // CHECK FUZZY SEARCH
    if (incomingMessage && evalAIOnly === false && messageToRespond.response1 === null) {
      const options = {
        includeScore: true,
      };
      try {
        const fuse = new Fuse(messagesAndResponses[key].possibleMessages, options);
        const result = fuse.search(incomingMessage);

        if (result.length > 0 && result[0].score >= 1) {
          console.log(' -- Found Existing Fuzzy Scenario -- ')
          messageToRespond = messagesAndResponses[key].responses;
        }
      } catch (e) {
        console.log('FUSE no match found');
      }

    }
  }

  // DEFAULT AI RESPONSE ADD "isAIResponse = true"
  if (messageToRespond.response1 === null) {
    try {
      const result = await axios.post(
        'https://us-central1-simpbot-bf277.cloudfunctions.net/ai',
        { text: incomingMessage }
      );
      isAIResponse = true;
      messageToRespond = {
        response1: result.data.text,
        waitTime1: 2,
      }
      console.log(' -- Returned AI Scenario -- ')
    } catch (e) {
      console.log('NO AI MATCH', e)
    }

  }

  return {
    isAIResponse,
    messageToRespond,
  };
}




// {
//   howLongYouBeenResponse: {
//     possibleMessages: [
//       'How long u been here?',
//       'How long you been',
//       'How long have you been',
//       'How long have you been here?',
//       'How long have u been here',
//       'How long have u lived here',
//       'How long have u lived in',
//       'How long have you lived in',
//       'U been here long',
//       'Have you been in town',
//       'U been here',
//       'Since when have you lived here',
//       'When did u move here',
//       'When did u move',
//       'When did you move',
//       'my g how long u been here'
//     ],
//     responses: {
//       response2: "Hey! Sorry I got really busy 😅, I ended up helping my friend who had a recent breakup get over it… I ended up getting her some ice cream and we just watched a movie together🥰🥰 Anyways, sooo i'm not really on here too often and I would love to chat more so wanna message me on IG??",
//       waitTime1: 2,
//       response3: [Array],
//       waitTime2: 5,
//       response1: 'Not too long! Still getting used to it, but I like it :)'
//     }
//   },
//   howsItGoingResponse: {
//     possibleMessages: [
//       'Doing well, hbu?',
//       'Good!',
//       'Good and you?',
//       'Good you?',
//       'Im great',
//       'Im great how are you',
//       'im good how are you',
//       'Amazing and you?',
//       'fine you?',
//       'fantastic and you?',
//       'Good and u?',
//       'good u?',
//       'and yourself?',
//       'Good and yourself?',
//       'how are you?',
//       'u?',
//       'how u?',
//       'and u?',
//       'and you?',
//       'and yourself?',
//       'not too bad!',
//       'not too shabby and you',
//       'not too bad and you?',
//       'decent how are you?',
//       'decent and you?',
//       'decent u?',
//       'chillin hbu?',
//       'great hbu?',
//       'hbu?',
//       'vibin hbu',
//       'vibin and you?',
//       'how are ya doin?',
//       'how are ya doing',
//       'how are ya doin',
//       'how are ya doing?'
//     ],
//     responses: {
//       response2: "Well I appreciate that! I was thinking about getting her these UGG boots actually she really liked!  Anyways I feel bad not responding as often 😓 Why don't you just message me on my instagram, i'm on there way more and i've realized this really isn't my cup of tea 😅",
//       waitTime2: 2,
//       response1: "Amazing! I'm doing good too! I've been soooo busy lately. Shopping for my friend's birthday gift rn 😋 I haven't found anything so some ideas are welcome!!",
//       waitTime1: 3
//     }
//   },
//   doYouLiveHereResponse: {
//     possibleMessages: [
//       'Do you live here',
//       'Do u live here?',
//       'Do u live her',
//       'U live here?',
//       'Are you from here',
//       'R u from here',
//       'Are u from here?',
//       'U from here',
//       'U from here my g?',
//       'u from here bb',
//       'do u live here',
//       "there's no way u live here",
//       'theres no way u live here',
//       'theres no way you live here',
//       'theres no way you live here?'
//     ],
//     responses: {
//       waitTime2: 5,
//       response2: "Hey! Sorry I got really busy 😅, I ended up helping my friend who had a recent breakup get over it… I ended up getting her some ice cream and we just watched a movie together🥰🥰 Anyways, sooo i'm not really on here too often and I would love to chat more so wanna message me on IG??",
//       waitTime1: 2,
//       response1: 'Im actually in town visiting my cousin until next week! 💃🏼 '
//     }
//   },
//   imDoingThisWhatsUpResponse: {
//     possibleMessages: [
//       'im just hangin',
//       'im just chillin',
//       'vibin',
//       'nothing',
//       'just left the gym',
//       'at the gym',
//       'just getting some food',
//       'grabbing food',
//       'eating some food',
//       'leaving work',
//       'working ',
//       'hanging',
//       'kickin back',
//       'on the boat',
//       'at the bar',
//       'watching tv'
//     ],
//     responses: {
//       response2: "Well I appreciate that! I was thinking about getting her these UGG boots actually she really liked! Anyways I feel bad not responding as often 😓 Why don't you just message me on my instagram, i'm on there way more and i've realized this really isn't my cup of tea 😅",
//       waitTime1: 3,
//       response1: "Hahaha love that.🤗 I’m chillin today! Spent yesterday running around town ALL day shopping for my friend's birthday gift! 😋 I ended up not finding anything so some ideas are welcome!!",
//       waitTime2: 6
//     }
//   },
//   notGoodHowsItGoingResponse: {
//     possibleMessages: [
//       'im ok hbu',
//       'Im alright hbu?',
//       'Im whatever hbu?',
//       'Not great hbu?',
//       'Not great and you? lol',
//       'Been better lol you?',
//       'Decent hbu?',
//       'ok and u?',
//       'alright and u?',
//       'getting by lol hbu',
//       'eh ive had better days',
//       'ive had better days for sure',
//       'eh im whatever today',
//       'honestly so stressed',
//       'honestly so stressed with work',
//       'so stressed with work',
//       'honestly terrible',
//       'terrible rn',
//       'i fell',
//       'i hurt myself',
//       'hurt rn',
//       'struggling lol',
//       'struggling',
//       'dealing with so much',
//       'doing so much work',
//       'dealing with so much'
//     ],
//     responses: {
//       waitTime1: 3,
//       response2: "Ya i’m sorry to hear that… I wish I could help ya know? Btw i'm not gonna be on this platform much longer, I think it's not very healthy but i'd like to keep talking? Add my instagram before I get rid of this 🤍",
//       waitTime2: 6,
//       response1: "Aww i'm sorry to hear that 🥺 That's deff no bueno….  Just know that everything always works out for our betterment! Or at least that's what I tell myself 😅😅 What's wrong though??🥺🤍"
//     }
//   },
//   areYouRealResponse: {
//     possibleMessages: [
//       'are u real',
//       'is this a real account lol',
//       'is this a real account',
//       'r u real',
//       'u real?',
//       'are you real?',
//       'you real?',
//       'is this account forreal',
//       'Are you real?',
//       'is this account fr',
//       'are you a real person',
//       'r u a real person',
//       'i feel like this account is fake',
//       'this account is fake',
//       'are u fake',
//       'r u fake'
//     ],
//     responses: {
//       response1: 'ArE yOu ReAl?? YES IM REAL 😂😂😂 LOL I am almost offended you think I am a fake person!! 🙄 What do you want me to do a flip too? So what are you up to??',
//       waitTime1: 3
//     }
//   },
//   whatsYourSnapResponse: {
//     possibleMessages: [
//       'hey whats your snap',
//       'can i get ur snap',
//       'can i have ur snap',
//       'snap?',
//       "what's your snap",
//       'send ur snap',
//       'can i get your snap',
//       'plz snap me',
//       'snap me',
//       'you should snap me',
//       'you could snap me',
//       'i want ur snap',
//       'i need your snap',
//       'i want your snap',
//       'i need ur snap',
//       'can i has your snap',
//       'you should send me your snap',
//       'you should send me ur snap',
//       'you could snap me',
//       'you could send me your snap',
//       'we could snap',
//       'we should snap',
//       'i mean snap works',
//       'snap works',
//       'snap is lit',
//       'send the snap'
//     ],
//     responses: {
//       response1: "I don't feel comfortable giving out my snapchat yet but you can message me on instagram if that’s easier since I don't get notifications on here 😅",
//       waitTime1: 2
//     }
//   },
//   whatsYourNumberResponse: {
//     possibleMessages: [
//       'whats ur number',
//       'can i have ur number',
//       'can i have your number',
//       'will you send me your number',
//       'send me your number',
//       'send number plz',
//       'can i has ur number',
//       'you should give me your number',
//       'give me your number',
//       'send me them digits',
//       'send me your digits',
//       'need your number',
//       'what your #',
//       'send #',
//       'whats ur #'
//     ],
//     responses: {
//       waitTime1: 2,
//       response1: "I don't feel comfortable giving out my number yet but you can message me on instagram if that’s easier since I don't get notifications on here 😅"
//     }
//   },
//   whatsUpResponse: {
//     possibleMessages: [
//       'whats up',
//       'what you doin',
//       'whatre you up to?',
//       'What u up to',
//       "what're u up to",
//       'sup',
//       'wat u doin',
//       'Im just chillin hbu?',
//       'wyd',
//       'what up with u',
//       'whats up with you',
//       'wat up with u',
//       'what up'
//     ],
//     responses: {
//       response1: "Actually I’m chillin today! I spent yesterday running around town ALL day shopping for my friend's birthday gift! I ended up not finding anything so some ideas are welcome!!",
//       waitTime1: 3,
//       response2: "Well I appreciate that! I was thinking about getting her these UGG boots actually she really liked! Anyways I feel bad not responding as often 😓 Why don't you just message me on my instagram, i'm on there way more and i've realized this really isn't my cup of tea 😅",
//       waitTime2: 6
//     }
//   },
//   immediatePivotResponse: {
//     responses: {
//       response1: "You're really cute! 😍 Honestly I am gonna delete this soon since it hasn't really panned out for me….😕 but you should add me on Instagram! I’m just there a SCARY amount and don’t really see the need for endless swiping anymore ya know?😅😅 Anyways, here is my instagram if you wanna chat more?"
//     }
//   },
//   initialResponse: {
//     responses: {
//       response3: 'meme',
//       response1: "Hi what's up",
//       response4: 'Hey',
//       response6: 'hi🦋',
//       response2: "Hey how's it goin",
//       response5: '🤗🤭'
//     }
//   },
//   randomShitResponse: {
//     responses: {
//       response1: "Hey! Sorry I got really busy 😅, I ended up helping my friend who had a recent breakup get over it… I ended up getting her some ice cream and we just watched a movie together🥰🥰 Anyways, sooo i'm not really on here too often and I would love to chat more so wanna message me on IG?? Possibly, potentially, maybe…I'm just on their a scary amount😂 🤗",
//       waitTime1: 4
//     }
//   }
// }