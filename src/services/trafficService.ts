import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { TrafficCampaign, VideoContent } from '../types';

const CAMPAIGNS_COLLECTION = 'traffic_campaigns';
const CONTENT_COLLECTION = 'video_content';

export const trafficService = {
  async getCampaignsByBrand(brandId: string): Promise<TrafficCampaign[]> {
    try {
      const q = query(collection(db, CAMPAIGNS_COLLECTION), where('brandId', '==', brandId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as TrafficCampaign);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, CAMPAIGNS_COLLECTION);
      return [];
    }
  },

  subscribeToCampaigns(callback: (campaigns: TrafficCampaign[]) => void) {
    const q = collection(db, CAMPAIGNS_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as TrafficCampaign));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, CAMPAIGNS_COLLECTION);
    });
  },

  subscribeToContent(callback: (content: VideoContent[]) => void) {
    const q = collection(db, CONTENT_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as VideoContent));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, CONTENT_COLLECTION);
    });
  },

  async saveCampaign(campaign: TrafficCampaign) {
    const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
    try {
      await setDoc(campaignRef, {
        ...campaign,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${CAMPAIGNS_COLLECTION}/${campaign.id}`);
    }
  }
};
