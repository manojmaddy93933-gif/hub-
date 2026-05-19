import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Worker, Attendance, StaffSchedule, OperationType } from '../types';

enum OperationTypeLocal {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationTypeLocal;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationTypeLocal, path: string | null) {
  console.error(`Firestore Error [${operationType}] on ${path}:`, error);
  throw error;
}

export const attendanceService = {
  // Worker Management
  async getAllWorkers(): Promise<Worker[]> {
    const path = 'workers';
    try {
      const q = query(collection(db, path), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.LIST, path);
      return [];
    }
  },

  async addWorker(worker: Omit<Worker, 'id'>): Promise<string> {
    const path = 'workers';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...worker,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.CREATE, path);
      throw error;
    }
  },

  async updateWorker(id: string, updates: Partial<Worker>): Promise<void> {
    const path = `workers/${id}`;
    try {
      await updateDoc(doc(db, 'workers', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.UPDATE, path);
      throw error;
    }
  },

  async deleteWorker(id: string): Promise<void> {
    const path = `workers/${id}`;
    try {
      await deleteDoc(doc(db, 'workers', id));
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.DELETE, path);
      throw error;
    }
  },

  async getWorkerByCode(code: string): Promise<Worker | null> {
    const path = 'workers';
    try {
      const q = query(collection(db, path), where('workerCode', '==', code.toUpperCase()), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Worker;
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.GET, path);
      return null;
    }
  },

  async getLatestAttendance(workerId: string): Promise<Attendance | null> {
    const path = 'attendance';
    const today = new Date().toISOString().split('T')[0];
    try {
      const q = query(
        collection(db, path), 
        where('workerId', '==', workerId),
        where('date', '==', today),
        orderBy('checkIn', 'desc')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Attendance;
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.GET, path);
      return null;
    }
  },
  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const path = 'attendance';
    try {
      const q = query(collection(db, path), where('date', '==', date));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.LIST, path);
      return [];
    }
  },

  async markAttendance(attendance: Omit<Attendance, 'id'>): Promise<string> {
    const path = 'attendance';
    try {
      // Check if attendance already exists for this worker on this date
      const q = query(
        collection(db, path), 
        where('workerId', '==', attendance.workerId),
        where('date', '==', attendance.date)
      );
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        const id = existing.docs[0].id;
        await updateDoc(doc(db, path, id), { ...attendance });
        return id;
      }

      const docRef = await addDoc(collection(db, path), attendance);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.CREATE, path);
      throw error;
    }
  },

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<void> {
    const path = `attendance/${id}`;
    try {
      await updateDoc(doc(db, 'attendance', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.UPDATE, path);
      throw error;
    }
  },

  // Scheduling Management
  async getSchedulesByDate(date: string): Promise<StaffSchedule[]> {
    const path = 'schedules';
    try {
      const q = query(collection(db, path), where('date', '==', date));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffSchedule));
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.LIST, path);
      return [];
    }
  },

  async addSchedule(schedule: Omit<StaffSchedule, 'id'>): Promise<string> {
    const path = 'schedules';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...schedule,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.CREATE, path);
      throw error;
    }
  },

  async deleteSchedule(id: string): Promise<void> {
    const path = `schedules/${id}`;
    try {
      await deleteDoc(doc(db, 'schedules', id));
    } catch (error) {
      handleFirestoreError(error, OperationTypeLocal.DELETE, path);
      throw error;
    }
  }
};
