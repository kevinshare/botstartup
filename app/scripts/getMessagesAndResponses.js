export default async (db) => {
  let allPotentialMessages;
  let messagesAndResponses;

  const potentialMessagesSnapshot = await db.collection('potentialMessages').get();

  await potentialMessagesSnapshot.forEach(async (doc) => {
    allPotentialMessages = { ...doc.data() };
  });

  const collectionKeys = Object.keys(allPotentialMessages);


  const getFullMappedData = async (dataLength, keys) => {
    if (dataLength > 0) {
      const key = keys[dataLength - 1];
      const currentSnap = await db.collection(key).get();

      currentSnap.forEach(docAtKey => {
        messagesAndResponses = {
          ...messagesAndResponses,
          [key]: {
            possibleMessages: allPotentialMessages[key],
            responses: { ...docAtKey.data() },
          }
        };
      });

      return await getFullMappedData(dataLength - 1, keys);
    } else {
      const immediateSnapShot = await db.collection('immediatePivotResponse').get();
      immediateSnapShot.forEach(docAtKey => {
        messagesAndResponses = {
          ...messagesAndResponses,
          immediatePivotResponse: {
            responses: { ...docAtKey.data() },
          }
        };
      });

      const initialSnapshot = await db.collection('initialResponse').get();
      initialSnapshot.forEach(docAtKey => {
        messagesAndResponses = {
          ...messagesAndResponses,
          initialResponse: {
            responses: { ...docAtKey.data() },
          }
        };
      });

      const randomShitSnapshot = await db.collection('randomShitResponse').get();
      randomShitSnapshot.forEach(docAtKey => {
        messagesAndResponses = {
          ...messagesAndResponses,
          randomShitResponse: {
            responses: { ...docAtKey.data() },
          }
        };
      });
    }
  }

  await getFullMappedData(collectionKeys.length, collectionKeys);

  return messagesAndResponses;
}