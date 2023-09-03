import cities from "toppop-cities";
import getProperResponse from "./getProperResponse.js";
import moment from 'moment';
import { setTimeout } from "timers/promises";
import checkForConfirmation from "./checkForConfirmation.js";
// const player = require("play-sound")((opts = {}));

//sleep function to pause further code
const sleep = ms => new Promise(r => setTimeout(r, ms));

let intervalTime = 3000;
let locationChangeCount = 0;
let firstSwipe = true;
let swipes = 20;

export default async (
    ig,
    browser,
    page,
    notifier,
    messagesAndResponses,
    updateConversation,
    createConversation,
    getConversation,
) => {


    // WAIT FOR SWIPABLE CARD TO EXIST
    const checkForSwipeCard = async () => {
        let cardExists = false;
        try {
            await page.waitForXPath(
                '//*[@id="main"]/div/div[1]/main/div[2]/div/div/span/div[2]/div/div[2]/div/div[3]/div',
                { timeout: 10000 }
            );
            // 

            cardExists = true;

        } catch (err) {

            console.log("There is no card to swipe" + err);

            cardExists = false;
        }

        try {
            await page.waitForXPath(
                '//*[@id="main"]/div/div[1]/main/div[2]/div/div/span/div[2]/div/div[2]/div/div[2]/div',
                { timeout: 10000 }
            );
            cardExists = true;
        } catch (e) {
            console.log("There is no card to swipe" + e);

            cardExists = false;
        }

        return cardExists;
    };

    // CHECK IF THE MATCH MODAL APPEARS
    const isAMatch = async () => {
        try {
            await page.waitForXPath(
                '//*[@id="main"]/div/div[1]/main/div[2]/article/div/footer/div[2]/div[2]/div',
                { timeout: 10000 }
            );

            return true;

        } catch (err) {

            console.log("NO MATCH CONTINUE SWIPING " + err);

            return false;
        }
    }

    // RANDOM SWIPE SELECTOR 
    const randomSwipeSelector = (firstSwipe) => {
        if (firstSwipe) {
            return "[aria-label='Like']";
        }
        const randomNum = Math.random() * 5;
        if (randomNum < 1) {
            return "[aria-label='Pass']";
        } else {
            return "[aria-label='Like']";
        }
    };


    // CHANGE LOCATION TO RANDOM CITY
    const changeRandomLocation = () => {
        const index = Math.floor(Math.random() * cities.length);
        console.log("Current location ");

        //send a notification
        notifier.notify({
            title: "No profiles, Location Changed To",
            message: cities[index].name,
            sound: false,
            wait: true
        });

        page.setGeolocation({
            latitude: cities[index].latitude,
            longitude: cities[index].longitude
        });
    };


    // CURRENTLY NOT NEEDED BUT GRABS MATCHES CAROUSEL BUTTON TO EXPOSE MORE MATCHES
    const getCarouselButton = async () => {
        try {
            const [carouselButton] = await page.$x('/html/body/div/div/div[1]/aside/div/div[3]/div/div/section[1]/div/section/section/div[2]');
            return carouselButton;
        } catch (e) {
            console.log('Could not find carousel button!');
        }
    }

    // WAIT FOR TEXT AREA TO RENDER THEN TYPE RESPONSE AND SUBMIT
    const typeAndSubmitMessages = async (
        messagesToSend,
        index
    ) => {
        await setTimeout(1000);
        try {
            await page.waitForXPath(
                '//*[@id="main"]/div/div[1]/main/div[3]/div/div[1]/div/div/textarea[1]',
                { timeout: 20000 }
            );

            await page.type('.textarea__input', messagesToSend[index]);
            await page.waitForSelector('.textarea__input:not(:empty)');


            const sendButton = await page.$('.message-field__send');
            await sendButton.click();
            if (messagesToSend[index + 1]) {
                await setTimeout(4000)
                return await typeAndSubmitMessages(
                    messagesToSend,
                    index + 1
                );
            } else {
                return true;
            }

        } catch (e) {
            console.log('No text box user expired');
            return false;
        }
    }

    // LOOP THROUGH MATCHES AND SEND A RANDOM INITAL RESPONSE EVERY FEW SECONDS
    const assessMatches = async () => {
        const matches = [];
        let intervalClick;
        let finishedProcess = false;

        // WAIT FOR MATCHES SECTION TO EXIST
        try {
            console.log('waiting for matches')
            await page.waitForXPath(
                '//*[@id="main"]/div/div[1]/aside/div/div[3]/div/div/section[1]/div/section/section/div[1]',
            )
        } catch (e) {
            console.log('CANT FIND MATCHES AREA')
        }

        const clickElementAndMessage = async (els, uidAttr, nameAttr, index) => {

            // CLICK THE MATCH AT THE CURRENT INDEX
            try {
                await els[index].click();
            } catch (e) {
                console.log('End of matches clear interval');
                finishedProcess = true;
                return;
            }

            const responsesToSend = ['response1', 'response2', 'response3', 'response4', 'response5', 'response6'];

            const responseToSend = responsesToSend[Math.floor(Math.random() * responsesToSend.length)];

            // Create conversation with uidAttr[index] and nameAttr[index] and 
            try {
                await createConversation(nameAttr[index], uidAttr[index]);
            } catch (e) {
                console.log('Could not create conversation at ' + uidAttr[index], e);
            }

            await setTimeout(4000);

            const messageSent = await typeAndSubmitMessages(
                [messagesAndResponses.initialResponse.responses[responseToSend]],
                0
            );

            if (messageSent === true) {
                await setTimeout(6000);
                const elements = await page.$$("div.scrollable-carousel-item");
                const uidAttr = await page.$$eval(
                    ".scrollable-carousel-item",
                    el => el.map(item => item.getAttribute("data-qa-uid"))
                );
                const nameAttr = await page.$$eval(
                    ".scrollable-carousel-item",
                    el => el.map(item => item.getAttribute("data-qa-name"))
                );

                return await clickElementAndMessage(elements, uidAttr, nameAttr, 1);
            }

            return;

            // else {
            //     // WAIT 3 SECONDS AND FOR THE TEXT FIELD TO HAVE THE RANDOM INITIAL RESPONSE THEN FIRE RECURSIVE CHECK
            //     if (els[index + 1]) {
            //         return await clickElementAndMessage(els, uidAttr, nameAttr, index + 1);
            //     }
            // }


        }

        // CURRENT SCROLLABLE MATCH BADGES
        const elements = await page.$$("div.scrollable-carousel-item");
        const uidAttr = await page.$$eval(
            ".scrollable-carousel-item",
            el => el.map(item => item.getAttribute("data-qa-uid"))
        );
        const nameAttr = await page.$$eval(
            ".scrollable-carousel-item",
            el => el.map(item => item.getAttribute("data-qa-name"))
        );

        await clickElementAndMessage(elements, uidAttr, nameAttr, 1);

        await setTimeout(6000);
        await scrollConversations();
        await setTimeout(1000);
        await scrollConversations();
        await setTimeout(1000);
        await scrollConversations();
        await setTimeout(1000);
        await scrollConversations();
        await setTimeout(1000);
        await scrollConversations();
        await setTimeout(1000);
        await scrollConversations();
        await setTimeout(1000);
        await scrollConversations();
        await setTimeout(1000);
        await scrollConversations();

        await assessConversations();
    }

    const scrollConversations = async () => {
        const scrollable_section = '.scroll__inner';

        await page.waitForSelector('.scroll__inner');

        await page.evaluate(selector => {
            const scrollableSection = document.querySelector(selector);

            scrollableSection.scrollTop = scrollableSection.scrollHeight;

        }, scrollable_section);


        return true;
    }

    const assessMessagesLastReceived = async (
        messagesLastReceieved,
        messageIndex,
        convoData,
        messagesToSend,
        response2Count,
        responseWithResponse2,
        evalAIOnly,
    ) => {
        let responseArray = messagesToSend;
        let currentResponse2Count = response2Count;
        let responseFoundWithResponse2 = responseWithResponse2;
        let properResponse = {};

        const finalPivotResponseArray = messagesAndResponses['randomShitResponse']['responses']['response2'];
        const waitTime2 = messagesAndResponses['randomShitResponse']['responses']['waitTime2'];
        const index = Math.floor(Math.random() * finalPivotResponseArray.length);
        const finalPivotResponse2 = finalPivotResponseArray[index];


        // GET PROPER RESPONSE TO MSSG
        if (
            messagesLastReceieved &&
            messagesLastReceieved[messageIndex] &&
            messagesLastReceieved[messageIndex]['mssg'] &&
            messagesLastReceieved[messageIndex]['mssg'].length > 0
        ) {
            properResponse = await getProperResponse(
                messagesLastReceieved[messageIndex]['mssg'],
                messagesAndResponses,
                evalAIOnly,
                ig,
            );
        }

        // GET PROPER RESPONSE TO REACTION
        if (
            messagesLastReceieved &&
            messagesLastReceieved[messageIndex] &&
            messagesLastReceieved[messageIndex]['reaction'] &&
            messagesLastReceieved[messageIndex]['reaction']['text'] &&
            messagesLastReceieved[messageIndex]['reaction']['text'].length > 0
        ) {

            properResponse = await getProperResponse(
                messagesLastReceieved[messageIndex]['reaction']['text'],
                messagesAndResponses,
                evalAIOnly,
                ig,
            );
        }

        // IF RESPONSE 2 EXISTS ON THIS MESSAGE UP THE COUNT BY 1
        if (properResponse.messageToRespond && properResponse.messageToRespond.response2) {
            currentResponse2Count = currentResponse2Count + 1;
        }

        // IF THE RESPONSE 2 EXISTS AND ITS THE FIRST ONE ADD AS THE RESPONSE 2 TO USE
        if (properResponse.messageToRespond && properResponse.messageToRespond.response2 && currentResponse2Count === 1) {
            responseFoundWithResponse2 = properResponse.messageToRespond;
        }

        // IF RESPONSE COUNT IS MORE THAN 1 JUST DEFAULT TO RANDOM SHIT RESPONSE TO BE SAFE
        if (currentResponse2Count > 1) {
            responseFoundWithResponse2 = {
                response2: finalPivotResponse2,
                waitTime2: waitTime2,
            }
        }

        // IF WE ONLY HAD A RESPONSE 1 THE FIRST ROUND WE DEFAULT TO AI ONLY EVAL SO WE SAFELY USE RANDOM SHIT RESPONSE
        if (evalAIOnly && responseFoundWithResponse2 === null) {
            responseFoundWithResponse2 = {
                response2: finalPivotResponse2,
                waitTime2: waitTime2,
            }
        }

        // IF RESPONSE 2 ON THIS MESSAGE DOESNT MATCH RESPONSE 2 VARIABLE AND IT MATCHES THE DB JUST ADD IT TO ARRAY
        if (
            responseFoundWithResponse2
            & properResponse.messageToRespond
            && properResponse.messageToRespond.response2
            && properResponse.messageToRespond.response2 !== responseFoundWithResponse2.response2
        ) {
            responseArray = [...responseArray, properResponse.messageToRespond];
            // IF THERE JUST ISNT RESPONSE 2 YET ITS A RESPONSE 1 OR AI RESPONSE ADD TO ARRAY
        } else if (properResponse.messageToRespond && responseFoundWithResponse2 && !properResponse.messageToRespond.response2) {
            responseArray = [...responseArray, properResponse.messageToRespond];
        } else if (properResponse.messageToRespond && !responseFoundWithResponse2) {
            responseArray = [...responseArray, properResponse.messageToRespond];
        }

        // LOOP BACK OVER MESSAGES WHILE NEXT EXISTS
        if (messageIndex + 1 < messagesLastReceieved.length) {
            return await assessMessagesLastReceived(
                messagesLastReceieved,
                messageIndex + 1,
                convoData,
                responseArray,
                currentResponse2Count,
                responseFoundWithResponse2,
                evalAIOnly
            )

        }

        // IF WE HAVE A RESPONSE 2 AT THE END OF PROCESS, APPLY TO END OF ARRAY SO WE GUIDE CONVERSATION
        if (responseFoundWithResponse2) {
            responseArray = [
                ...responseArray,
                responseFoundWithResponse2
            ]
        }

        return responseArray;
    }

    const getAndUpdateConversation = async (messages, convoData, convoUserId, evalAIOnly) => {

        // GRAB PROPER RESPONSE FOR EACH MESSAGE AND RETURN ORDERED ARRAY OF RESPONSES (RESPONSE WITH R2 LAST)
        const messagesToUpdate = await assessMessagesLastReceived(
            messages,
            0,
            convoData,
            [],
            0,
            null,
            evalAIOnly,
        );

        let waitTime = null;
        let response2 = null;
        let waitTime2 = null;
        const stringResponses = [];

        messagesToUpdate.forEach((item, i) => {
            // ASSIGN waitTime FOR FIRST RESPONSE MESSSAGES BUT IF ONE IS FOUND DONT ADD AGAIN
            if (item.response1) {
                stringResponses.push(item.response1);
                if (item.waitTime1 && waitTime === null) {
                    waitTime = item.waitTime1;
                } else if (i === messagesToUpdate.length - 1 && waitTime === null) {
                    waitTime = 2;
                }
            }
            // IF LAST ITEM WHICH SHOULD BE RESPONSE 2 ASSIGN response2 AND waitTime2 FOR SECONDARY RESPONSE IN SEQUENCE 
            if (i === messagesToUpdate.length - 1 && item.response2) {
                response2 = item.response2;
                if (item.waitTime2) {
                    waitTime2 = item.waitTime2;
                } else {
                    waitTime2 = 6;
                }
            }
        });

        /*
            UPDATE CONVERSATION WITH 
                messagesToSend,
                nextSendTime AS waitTime1 remember function takes in waitTime number
                response2 AND waitTime2 IF EXISTS
        */
        if (convoData) {
            try {
                await updateConversation(
                    waitTime,
                    convoUserId,
                    convoData.response1Sent,
                    stringResponses,
                    response2,
                    waitTime2,
                    convoData.finished,
                );
            } catch (e) {
                console.log('Error updating conversation', e);
            }
        }

    }

    // GRAB CURRENT MESSAGES, GET CONVERSATION / UPDATE CONVERSATION BY DATA-QA-UID / TYPE MESSAGE AFTER EVALUATING INTENT
    const readAndReply = async (index, attr, messages) => {
        const { uidAttr, nameAttr } = attr;
        // FIND THE LAST MESSAGE WE SENT INDEX AND SLICE MESSAGES TO ONLY MESSAGES AFTER THAT SO ITS LATEST RECEIVED
        let latestIncomingMessages = [];
        let lastSentIndex = null;
        let messagesSentSoFar = 0;

        // START EARLIEST RECEIVED TO LATEST UNTIL YOU FIND FIRST MESSAGE FROM US.
        for (let i = messages.length - 1; i > -1; i = i - 1) {
            if (messages[i].from_person_id !== uidAttr[index]) {
                if (lastSentIndex === null) {
                    lastSentIndex = i;
                }
                messagesSentSoFar = messagesSentSoFar + 1;
            }
        }

        // POTENTIALLY GROUP MESSAGES
        // let organizedMessages = latestIncomingMessages;

        // if (latestIncomingMessages.length > 2) {
        //     let joinedMessage = ''
        //     latestIncomingMessages.forEach(item => {
        //         joinedMessage.concat(`. ${item['mssg']}`);
        //     })
        // }

        // Slice from 0-2 and make 1 record with mssg as combined values

        // Add the rest of any existing messages

        //SLICE AFTER TO END FOR LATEST
        latestIncomingMessages = messages.slice(lastSentIndex + 1);

        try {
            const convoData = await getConversation(uidAttr[index]);

            if (
                convoData
                && convoData.messagesToSend?.some(currentMessage => currentMessage.includes(ig))
                && convoData.response1Sent
            ) {
                return;
            }

            if (convoData && convoData.finished) {
                const isConfirmed = checkForConfirmation(latestIncomingMessages);

                // const successField = 'confirmedIGMessage';
                // const failedField = 'declinedIGMessage';
                // if (latestIncomingMessages.length > 0 && isConfirmed) {
                //     await updateEngagements(successField, uidAttr[index])
                // }

                // if (latestIncomingMessages.length > 0 && !isConfirmed) {
                //     await updateEngagements(failedField, uidAttr[index])
                // }

                if (latestIncomingMessages.length > 0) {
                    // UNFOLLOW USER
                    const elements = await page.$$("div.messages-header__menu-item");
                    console.log(elements, "ELEMENTS");

                    if (elements && elements.length > 0) {
                        if (elements.length < 4) {
                            elements[0].click();
                        } else {
                            elements[2].click();
                        }

                    }

                    // .dropdown__content


                    // Find the iframe
                    // const frame = await await page.$$eval("div > div.dropdown__content");
                    await setTimeout(2000);
                    const frame = await page.$(".dropdown__content");
                    console.log(frame);

                    // Click
                    await page.mouse.click(1650, 72);

                    await setTimeout(2000);
                    await page.mouse.click(1100, 552);

                    return '';

                }

                if (convoData.nextSendTime && moment().diff(moment(convoData.nextSendTime), 'days') > 2) {
                    if (latestIncomingMessages.length > 0) {
                        // UNFOLLOW USER
                        const elements = await page.$$("div.messages-header__menu-item");
                        console.log(elements, "ELEMENTS");

                        if (elements && elements.length > 0) {
                            if (elements.length < 4) {
                                elements[0].click();
                            } else {
                                elements[2].click();
                            }
                        }
                        // .dropdown__content

                        // Find the iframe
                        // const frame = await await page.$ $eval("div > div.dropdown__content");
                        await setTimeout(2000);
                        const frame = await page.$(".dropdown__content");
                        console.log(frame);

                        // Click
                        await page.mouse.click(1650, 72);

                        await setTimeout(2000);
                        await page.mouse.click(1100, 552);

                        return '';
                    }

                }

                return;
            }

            if (convoData && convoData.nextSendTime && moment().isBefore(moment(convoData.nextSendTime))) {
                console.log('CURRENT CONVO SEND TIME IS BEFORE NEXT SEND TIME')
                return;
            }

            if (lastSentIndex === messages.length - 1) {
                return;
            }

            if (latestIncomingMessages.length === 0) {
                return;
            }

            // SEND RESPONSE 2
            if (
                convoData &&
                convoData.messagesToSend
                && convoData.nextSendTime
                && moment().isSameOrAfter(moment(convoData.nextSendTime))
                && convoData.response1Sent === true
                && convoData.response2
            ) {
                await typeAndSubmitMessages([convoData.response2, ig], 0);

                await updateConversation(
                    convoData.waitTime2,
                    uidAttr[index],
                    convoData.response1Sent,
                    convoData.messagesToSend,
                    convoData.response2,
                    convoData.waitTime2,
                    true,
                );
                return true;
            }


            // SEND RESPONSE 1
            if (
                convoData &&
                convoData.messagesToSend
                && convoData.messagesToSend.length > 0
                && convoData.nextSendTime
                && convoData.nextSendTime.length > 0
                && moment().isSameOrAfter(moment(convoData.nextSendTime))
                && convoData.response1Sent === false
            ) {
                await typeAndSubmitMessages(convoData.messagesToSend, 0);

                // MARK RESPONSE 1 SENT NOW, IF RESPONSE 2 AND WAITTIME2 SET NEXT SEND TIME
                await updateConversation(
                    convoData.waitTime2,
                    uidAttr[index],
                    true,
                    convoData.messagesToSend,
                    convoData.response2,
                    convoData.waitTime2,
                    convoData.finished,
                );
                return true;
            }

            // IF ALL RESPONSE 1's AND BEEN SENT, ADD ANOTHER SET AND THE DEFAULT RESPONSE 2
            if (
                convoData &&
                convoData.messagesToSend
                && convoData.nextSendTime
                && convoData.nextSendTime.length > 0
                && moment().isSameOrAfter(moment(convoData.nextSendTime))
                && convoData.response1Sent === true
                && convoData.response2 === null
            ) {
                await getAndUpdateConversation(latestIncomingMessages, convoData, uidAttr[index], true);
                return true;
            }

            await getAndUpdateConversation(latestIncomingMessages, convoData, uidAttr[index], false);


            return true;
        } catch (e) {
            console.log('Could not read and reply to ' + nameAttr[index], e);
            return false;
        }

    }

    // LOOP THROUGH CONVOS RECURSIVELY AND CHECK IF THEY NEED TO BE REPLIED TO
    const loopConversations = async (
        index,
        convosLength,
        conversations,
        uidAttr,
        nameAttr,
        retry
    ) => {
        const convoIndex = index;

        try {
            const currentConvoRow = conversations[convoIndex];

            let contactNotificationsDiv = null;

            const getConversationsArray = (conversationsArray, status) => {
                if (status === 'deleted') {
                    conversationsArray.splice(convoIndex, convoIndex);
                }
                return conversationsArray;
            }

            try {
                await currentConvoRow.$('.contact__move-label', { timeout: 5000 });
                contactNotificationsDiv = 'true';
            } catch (e) {
                contactNotificationsDiv = null;
                console.log("CANT FIND CONTACT LABEL")
                console.log("Current convo move label row doesn't exists");
            }

            if (contactNotificationsDiv === null) {
                try {
                    console.log("CANT FIND NOTIFICATiON MARK")
                    await currentConvoRow.$('.contact__notification-mark', { timeout: 5000 });
                    contactNotificationsDiv = 'true';
                } catch (e) {
                    console.log("Current convo notification mark row doesn't exists");
                    contactNotificationsDiv = null;
                }
            }

            // IF YOUR MOVE BADGE EXISTS AND CONVO INDEX IS STILL VALID CLICK AND READ REPLY -> NEXT
            if (contactNotificationsDiv === 'true') {
                await currentConvoRow.click();
                let convoMessages;

                await page.waitForResponse(async (response) => {
                    if (response.request().url().includes('SERVER_OPEN_CHAT')) {
                        const responseJson = await response.json();
                        convoMessages = responseJson.body[0].client_open_chat.chat_messages;
                    }

                    return convoMessages;
                });

                const simpAccountStatus = await readAndReply(convoIndex, { uidAttr, nameAttr }, convoMessages);
                if (convoIndex < convosLength - 1) {
                    await setTimeout(3000);
                    return await loopConversations(
                        simpAccountStatus && simpAccountStatus === 'deleted' ? convoIndex : convoIndex + 1,
                        convosLength,
                        getConversationsArray(conversations, simpAccountStatus),
                        uidAttr,
                        nameAttr,
                        retry
                    );
                } else {
                    // NO MORE CONVERSATIONS TO VIEW
                    console.log('All conversations assessed')
                    return true;
                }
            }
            // IF NO YOUR MOVE BADGE AND CONVO INDEX IS STILL VALID -> NEXT
            else {
                if (convoIndex < convosLength - 1) {
                    await setTimeout(3000);
                    return await loopConversations(
                        convoIndex + 1,
                        convosLength,
                        conversations,
                        uidAttr,
                        nameAttr,
                        retry
                    );
                } else {
                    // NO MORE CONVERSATIONS TO VIEW
                    console.log('All conversations assessed')
                    return true;
                }
            }

        } catch (e) {
            console.log('Problem looping coversations by contact classes: ', e);
            if (retry) {
                return loopConversations(
                    index,
                    convosLength,
                    conversations,
                    uidAttr,
                    nameAttr,
                    false
                )
            }
            return false;
        }


    }

    // WAIT FOR CONVERSATIONS WRAPPER TO EXIST AND GRAB ALL CONVERSATION ROWS AND START ASSESSMENT LOOP
    const assessConversations = async () => {
        await setTimeout(4000);
        await page.waitForXPath(
            '//*[@id="main"]/div/div[1]/aside/div/div[3]/div/div/section[2]/div',
        )

        const elements = await page.$$("div.contact");

        const uidAttr = await page.$$eval(
            ".contact",
            el => el.map(item => item.getAttribute("data-qa-uid"))
        );

        const nameAttr = await page.$$eval(
            ".contact",
            el => el.map(item => item.getAttribute("data-qa-name"))
        );

        const convosAssessed = await loopConversations(
            0,
            elements.length,
            elements,
            uidAttr,
            nameAttr,
            true,
        );

        if (convosAssessed === true) {
            console.log('assessed close BROWSER')
            await browser.close();
            await setTimeout(2000);
            process.exit();
        }
    }

    // SWIPE AT RANDOM INTERVAL
    const swipeCard = async () => {
        const isCardThere = await checkForSwipeCard();
        if (isCardThere && swipes > 0) {
            page
                .click(randomSwipeSelector(firstSwipe))
                .then(async () => {
                    if (isAMatch()) {
                        const [isMatchButton] = await page.$x('/html/body/div/div/div[1]/main/div[2]/article/div/footer/div[2]/div[2]/div');
                        if (isMatchButton && isMatchButton.click) {
                            await isMatchButton.click();
                        }
                    }
                    if (firstSwipe) {
                        firstSwipe = false;
                    }
                    swipes = swipes - 1;

                    // generate random number b/w 500 - 2500 for random swipe time
                    intervalTime = Math.floor(Math.random() * 2500) + 500;

                    if (swipes > 0) {
                        await setTimeout(intervalTime);
                        await swipeCard();
                    } else {
                        assessMatches();
                    }
                })
                .catch(err => {
                    if (err) {
                        console.log('Problem swiping matches, prob match button', err);
                        return true;
                    }

                });
        } else {
            assessMatches();
            return true;
        }
    };


    // await page.waitForRequest("https://bumble.com/mwebapi.phtml?SERVER_GET_USER_LIST");
    await swipeCard();
}