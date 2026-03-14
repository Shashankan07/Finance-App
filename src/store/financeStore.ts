import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

export interface Saving {
  id: string;
  userId: string;
  name: string;
  icon: string;
  current: number;
  target: number;
  color: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  amount: number;
  deadline: string;
  status: 'in-progress' | 'completed';
  progress: number;
}

interface FinanceState {
  transactions: Transaction[];
  savings: Saving[];
  goals: Goal[];
  budget: number | null;
  loading: boolean;
  error: string | null;
  fetchTransactions: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchSavings: () => void;
  addSaving: (saving: Omit<Saving, 'id' | 'userId'>) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;
  fetchGoals: () => void;
  addGoal: (goal: Omit<Goal, 'id' | 'userId'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  fetchBudget: () => void;
  updateBudget: (budget: number) => Promise<void>;
}

let unsubscribeTransactions: (() => void) | null = null;
let unsubscribeSavings: (() => void) | null = null;
let unsubscribeGoals: (() => void) | null = null;
let unsubscribeBudget: (() => void) | null = null;

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  savings: [],
  goals: [],
  budget: null,
  loading: false,
  error: null,

  fetchTransactions: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    
    if (unsubscribeTransactions) unsubscribeTransactions();

    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      unsubscribeTransactions = onSnapshot(q, (snapshot) => {
        const txs: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          txs.push({
            id: doc.id,
            userId: data.userId,
            amount: data.amount,
            type: data.type,
            category: data.category,
            description: data.description || '',
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
          });
        });
        txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        set({ transactions: txs, loading: false });
      }, (error) => {
        set({ error: error.message, loading: false });
        handleFirestoreError(error, OperationType.LIST, 'transactions');
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    }
  },

  addTransaction: async (transactionData) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    set({ loading: true, error: null });
    try {
      const newTx = {
        ...transactionData,
        userId: user.uid,
        date: new Date(transactionData.date),
      };
      await addDoc(collection(db, 'transactions'), newTx);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  },

  fetchSavings: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    
    if (unsubscribeSavings) unsubscribeSavings();

    try {
      const q = query(collection(db, 'savings'), where('userId', '==', user.uid));
      unsubscribeSavings = onSnapshot(q, (snapshot) => {
        const items: Saving[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            userId: data.userId,
            name: data.name,
            icon: data.icon,
            current: data.current,
            target: data.target,
            color: data.color,
          });
        });
        set({ savings: items, loading: false });
      }, (error) => {
        set({ error: error.message, loading: false });
        handleFirestoreError(error, OperationType.LIST, 'savings');
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.LIST, 'savings');
    }
  },

  addSaving: async (savingData) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    set({ loading: true, error: null });
    try {
      const newItem = { ...savingData, userId: user.uid };
      await addDoc(collection(db, 'savings'), newItem);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.CREATE, 'savings');
    }
  },

  deleteSaving: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'savings', id));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.DELETE, `savings/${id}`);
    }
  },

  fetchGoals: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    
    if (unsubscribeGoals) unsubscribeGoals();

    try {
      const q = query(collection(db, 'goals'), where('userId', '==', user.uid));
      unsubscribeGoals = onSnapshot(q, (snapshot) => {
        const items: Goal[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            userId: data.userId,
            title: data.title,
            amount: data.amount,
            deadline: data.deadline,
            status: data.status,
            progress: data.progress,
          });
        });
        set({ goals: items, loading: false });
      }, (error) => {
        set({ error: error.message, loading: false });
        handleFirestoreError(error, OperationType.LIST, 'goals');
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.LIST, 'goals');
    }
  },

  addGoal: async (goalData) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    set({ loading: true, error: null });
    try {
      const newItem = { ...goalData, userId: user.uid };
      await addDoc(collection(db, 'goals'), newItem);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.CREATE, 'goals');
    }
  },

  deleteGoal: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.DELETE, `goals/${id}`);
    }
  },

  fetchBudget: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    if (unsubscribeBudget) unsubscribeBudget();

    try {
      unsubscribeBudget = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          set({ budget: data.budget || null });
        }
      }, (error) => {
        console.error("Error fetching budget:", error);
      });
    } catch (error: any) {
      console.error("Error setting up budget listener:", error);
    }
  },

  updateBudget: async (budget: number) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    set({ loading: true, error: null });
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid), { budget }, { merge: true });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  }
}));
