import puppeteer from "puppeteer";
import { firebase } from "@firebase/app";
import { setTimeout } from "timers/promises";
import * as dotenv from 'dotenv';
import "@firebase/firestore";
import "@firebase/auth";
import notifier from "node-notifier";
import processBumble from "./processBumble.js";
import startUpPuppeteer from "./startUpPuppeteer.js";
import getMessagesAndResponses from "./getMessagesAndResponses.js";
import getFirebaseFunctions from "./getFirebaseFunctions.js";
import checkForYellowCard from "./checkForYellowCard.js";
import checkForBannedAccount from "./checkForBannedAccount.js";
import screenshotElement from "./screenshotElement.js";
import postCaptcha from "./postCaptcha.js";
import getCaptcha from "./getCaptcha.js";
import submitCaptcha from "./submitCaptcha.js";
import phoneLogin from "./phoneLogin.js";

dotenv.config({ path: '../../.env' });

const enableBackgroundMode = process.env.ENABLE_BACKGROUND_MODE;
const enableStartPuppeteer = process.env.ENABLE_START_PUPPETEER;
const enableGetFirebaseConnectors = process.env.ENABLE_GET_FIREBASE_CONNECTORS;
const enableProcessBumble = process.env.ENABLE_PROCESS_BUMBLE;
const enablePhoneLogin = process.env.ENABLE_PHONE_LOGIN === 'true';
const enableFacebookLogin = process.env.ENABLE_FACEBOOK_LOGIN === 'true';

console.log(enableBackgroundMode, '-- Background enable flag');
console.log(enableStartPuppeteer, '-- Puppeteer enable flag');
console.log(enableGetFirebaseConnectors, '-- Connect to firebase enable flag');
console.log(enableProcessBumble, '-- Process Bumble post login enable flag');
// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

// await firebase get credentials

const cuteScraper = async () => {

  await firebase.auth().signInWithEmailAndPassword();

  const users = [];

  await db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      users.push({ ...doc.data() });
    });
  });

  // [[ GET ALL POSSIBLE MESSAGE SCENARIOS AN THEIR RESPONSES ]]
  const messagesAndResponses = await getMessagesAndResponses(db);


  // Set Timeout Run Each
  // item.firstName === 'Kira' ||Camille
  let timeOut = 200;
  const userId = process.argv[2] || process.env.USER_ID;
  const currentUser = users.filter(item => item.id === userId)[0];
  // setInterval(async () => {
  // [[ GET CURRENT USER INFO ]]
  const { email, password, currentLocation, id, ig, loginPhone, firstName } = currentUser;
  // [[ START PUPPETEER WITH CURRENT USER AND THEIR LOCATION ]]
  const {
    page,
    browser,
  } = enableStartPuppeteer === 'true' ? await startUpPuppeteer(
    puppeteer,
    id,
    firstName,
    loginPhone,
    email,
    password,
    currentLocation,
    enableBackgroundMode === 'true',
    enablePhoneLogin,
    enableFacebookLogin,
  ) : {};

  // [[ GET ALL FIREBASE REFERENCES AND UPDATE FUNCTIONS ]] {{ engagements, conversations, }}
  const {
    engagementsList,
    engagementIsListed,
    isFullEngagement,
    updateConversation,
    createConversation,
    getConversation,
    updateEngagements,
  } = enableGetFirebaseConnectors === 'true' ? await getFirebaseFunctions(db, id) : {};

  const isBanned = await checkForBannedAccount(page, currentUser.firstName);
  if (!isBanned) {
    await checkForYellowCard(page);
    console.log('check it')
  } else {
    console.log('process failed')
    process.exit();
  }

  const imageToSend = await screenshotElement(page, '.captcha__image');

  if (imageToSend) {
    const { captchaId } = await postCaptcha(imageToSend);
    const { solved, answer } = await getCaptcha(captchaId);
    console.log(solved, answer);

    if (solved) {
      console.log('Captcha Solved.')
      await submitCaptcha(page, answer);
      await phoneLogin(page, loginPhone, true);
    } else {
      console.log('Got Captcha Solved as False. Stuck at captcha double check submit page.')
    }

  }

  console.log('Made it through processsing ban')
  enableProcessBumble === 'true' ? processBumble(
    ig,
    browser,
    page,
    notifier,
    db,
    messagesAndResponses,
    engagementsList,
    engagementIsListed,
    isFullEngagement,
    updateConversation,
    createConversation,
    getConversation,
    updateEngagements,
  ) : () => { };

  // await setTimeout(5000);


};

export default cuteScraper;

await cuteScraper();
