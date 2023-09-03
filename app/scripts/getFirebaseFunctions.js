import moment from "moment";

export default async (db, id) => {
  const engagemetReference = await db.collection('engagements').doc(id);

  const currentEngagements = await engagemetReference.get();

  const engagementsList = currentEngagements.data();

  const updateEngagements = async (field, newId) => {
    const pulledEngagements = await engagemetReference.get();
    const dataToAdd = pulledEngagements.data()[field];

    if (!dataToAdd.includes(newId)) {
      dataToAdd.push(newId);
      await engagemetReference.set(
        {
          [field]: dataToAdd,
        },
        {
          merge: true,
        }
      )
    }
  }

  const engagementIsListed = (engagements, id) => {
    const cancelled = engagements['cancelled'].contains(id);
    const confirmedIGMessage = engagements['confirmedIGMessage'].contains(id);
    const failedResponse = engagements['failedResponse'].contains(id);
    const fullEngagement = engagements['fullEngagement'].contains(id);

    return {
      cancelled,
      confirmedIGMessage,
      failedResponse,
      fullEngagement,
    }
  }

  const isFullEngagement = (userMessagesList, botResponsesList) => {
    let isFullEngage = false;

    if (userMessagesList && botResponsesList) {
      if (userMessagesList.length > 2 && botResponsesList.length > 2) {
        isFullEngage = true;
      }
    }

    return isFullEngage;
  }

  const getConversation = async (userId) => {
    const conversationCollectionReference = await db.collection(`conversations-${id}`);
    // console.log(`conversations-${id}`)
    // console.log(userId);
    try {
      const currentConversation = await conversationCollectionReference.doc(userId).get();
      return currentConversation.data();
    } catch (e) {
      console.log('Conversation doesnt exist for evalutation');
      return false;
    }
  };

  const createConversation = async (
    name,
    userId,
  ) => {
    const conversationCollectionReference = await db.collection(`conversations-${id}`);
    conversationCollectionReference.doc(userId).set({
      'data-qa-name': name,
      'data-qa-uid': userId,
      finished: false,
      messagesToSend: null,
      response1Sent: false,
      response2: null,
      waitTime2: null,
      nextSendTime: null,
    })
  }

  const updateConversation = async (
    waitTime,
    userId,
    response1Sent,
    messagesToSend,
    response2,
    waitTime2,
    finished,
  ) => {
    const conversationCollectionReference = await db.collection(`conversations-${id}`);
    conversationCollectionReference.doc(userId).set({
      messagesToSend: messagesToSend,
      response1Sent: response1Sent,
      response2: response2,
      waitTime2: waitTime2,
      nextSendTime: moment().add(finished === false ? waitTime : 0, 'h').toISOString(),
      finished: finished,
    }, { merge: true })
  }

  return {
    engagementsList,
    engagementIsListed,
    isFullEngagement,
    updateConversation,
    createConversation,
    getConversation,
    updateEngagements,
  }
}