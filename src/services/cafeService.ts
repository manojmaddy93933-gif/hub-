import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { CafeMenuItem } from '../types';

const COLLECTION_NAME = 'menu';

export const cafeService = {
  async getMenuItems(): Promise<CafeMenuItem[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CafeMenuItem));
  },

  subscribeMenuItems(callback: (items: CafeMenuItem[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CafeMenuItem));
      callback(items);
    });
  },

  async addMenuItem(item: Omit<CafeMenuItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...item,
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async updateMenuItem(id: string, updates: Partial<CafeMenuItem>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  },

  async deleteMenuItem(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async toggleAvailability(id: string, currentStatus: boolean): Promise<void> {
    await this.updateMenuItem(id, { isAvailable: !currentStatus });
  }
};
