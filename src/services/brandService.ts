import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  onSnapshot,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Brand } from '../types';

const BRANDS_COLLECTION = 'brands';

export const brandService = {
  async getAllBrands(): Promise<Brand[]> {
    try {
      const q = query(collection(db, BRANDS_COLLECTION));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Brand);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, BRANDS_COLLECTION);
      return [];
    }
  },

  async saveBrand(brand: Brand) {
    const brandRef = doc(db, BRANDS_COLLECTION, brand.id);
    try {
      await setDoc(brandRef, {
        ...brand,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${BRANDS_COLLECTION}/${brand.id}`);
    }
  },

  async updateBrandMetrics(brandId: string, metrics: Partial<Pick<Brand, 'profit' | 'burn' | 'velocity' | 'orders' | 'status'>>) {
    const brandRef = doc(db, BRANDS_COLLECTION, brandId);
    try {
      await updateDoc(brandRef, {
        ...metrics,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${BRANDS_COLLECTION}/${brandId}`);
    }
  },

  subscribeToBrands(callback: (brands: Brand[]) => void) {
    const q = query(collection(db, BRANDS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const brands = snapshot.docs.map(doc => doc.data() as Brand);
      callback(brands);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, BRANDS_COLLECTION);
    });
  }
};
