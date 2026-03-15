import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AgentEvent } from '../types';

const EVENTS_COLLECTION = 'events';

export const eventService = {
  async logEvent(event: AgentEvent) {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    try {
      await addDoc(eventsRef, {
        ...event,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, EVENTS_COLLECTION);
    }
  },

  subscribeToEvents(callback: (events: AgentEvent[]) => void, limitCount: number = 50) {
    const q = query(
      collection(db, EVENTS_COLLECTION), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
        } as AgentEvent;
      });
      callback(events);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, EVENTS_COLLECTION);
    });
  }
};
