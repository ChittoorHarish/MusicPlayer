// participantSync.js
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useEventStore from '../stores/eventStore';

export const setupParticipantSync = (eventId) => {
  if (!eventId) return;

  // Create a reference to the event document
  const eventRef = doc(db, 'events', eventId);

  // Set up real-time listener for event changes
  const unsubscribe = onSnapshot(eventRef, (doc) => {
    if (doc.exists()) {
      const eventData = {
        id: doc.id,
        ...doc.data()
      };

      // Update the event data in the store with latest participants
      useEventStore.getState().setEventData(eventData);
    }
  });

  return unsubscribe;
};