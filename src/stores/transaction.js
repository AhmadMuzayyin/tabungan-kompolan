// src/stores/transaction.js
import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { useAuthStore } from './auth';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    pendingTransactions: [],
    loading: false,
    error: null,
    listeners: {}
  }),

  getters: {
    getPendingCount: (state) => state.pendingTransactions.length,

    getTransactionsByType: (state) => (type) => {
      return state.transactions.filter(t => t.type === type);
    },

    getTransactionsByStatus: (state) => (status) => {
      return state.transactions.filter(t => t.status === status);
    },

    getTransactionById: (state) => (id) => {
      return state.transactions.find(t => t.id === id);
    }
  },

  actions: {
    // Subscribe to realtime updates for user's transactions
    // Subscribe to realtime updates for user's transactions
    async subscribeToUserTransactions(userId) {
      if (this.listeners[`user-${userId}`]) {
        // Already subscribed
        return;
      }

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId)
        // Hilangkan orderBy untuk sementara jika belum membuat indeks
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const transaction = {
            id: doc.id,
            ...data,
            // Pastikan field timestamp dikonversi dengan benar
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          };
          transactions.push(transaction);
        });

        // Urutkan secara manual
        transactions.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA; // descending order (newest first)
        });

        this.transactions = transactions;

        // Trigger notification pada perubahan status
        snapshot.docChanges().forEach(change => {
          if (change.type === 'modified') {
            const newData = change.doc.data();
            if (newData.status === 'approved') {
              window.showNotification('Transaksi Anda telah disetujui!', 'success');
            } else if (newData.status === 'rejected') {
              window.showNotification('Transaksi Anda ditolak', 'error');
            }
          }
        });
      }, (error) => {
        console.error('Error in transaction subscription:', error);
        this.error = error.message;
      });

      this.listeners[`user-${userId}`] = unsubscribe;
      return unsubscribe;
    },

    // Subscribe to realtime updates for pending transactions (admin)
    async subscribeToPendingTransactions() {
      if (this.listeners['pending']) {
        // Already subscribed
        return;
      }

      const q = query(
        collection(db, 'transactions'),
        where('status', '==', 'pending'),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });

        this.pendingTransactions = transactions;
      }, (error) => {
        console.error('Error in pending transaction subscription:', error);
        this.error = error.message;
      });

      this.listeners['pending'] = unsubscribe;
      return unsubscribe;
    },

    // Unsubscribe from a specific listener
    unsubscribe(key) {
      if (this.listeners[key]) {
        this.listeners[key]();
        delete this.listeners[key];
      }
    },

    // Unsubscribe from all listeners
    unsubscribeAll() {
      Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
      this.listeners = {};
    },

    // Create a new transaction
    async createTransaction(transactionData) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();

      try {
        if (!authStore.user) {
          throw new Error('User not authenticated');
        }

        const transaction = {
          userId: authStore.user.uid,
          userName: authStore.profile?.name || authStore.user.displayName,
          amount: transactionData.amount,
          type: transactionData.type, // 'deposit' or 'withdraw'
          notes: transactionData.notes || '',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'transactions'), transaction);
        return { id: docRef.id, ...transaction };
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Update transaction status (admin)
    // Update transaction status (admin)
    async updateTransactionStatus(transactionId, status, adminNotes = '', editedAmount = null) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();

      try {
        if (!authStore.user || !authStore.isAdmin) {
          throw new Error('Unauthorized operation');
        }

        const transactionRef = doc(db, 'transactions', transactionId);
        const transactionDoc = await getDoc(transactionRef);

        if (!transactionDoc.exists()) {
          throw new Error('Transaction not found');
        }

        const transaction = transactionDoc.data();

        // Cek apakah jumlah telah diedit
        const isAmountEdited = editedAmount !== null && editedAmount !== transaction.amount;
        const finalAmount = isAmountEdited ? editedAmount : transaction.amount;

        // Persiapkan data untuk update
        const updateData = {
          status: status,
          adminNotes: adminNotes || '',
          approvedBy: authStore.user.uid,
          approverName: authStore.profile?.name || authStore.user.displayName,
          updatedAt: serverTimestamp()
        };

        // Jika jumlah diedit, tambahkan ke data update
        if (isAmountEdited) {
          updateData.amount = finalAmount;
          updateData.originalAmount = transaction.amount; // Menyimpan jumlah asli untuk referensi
          updateData.isAmountEdited = true;
        }

        // Update transaction
        await updateDoc(transactionRef, updateData);

        // If approved, update user balance
        if (status === 'approved') {
          // Get user's current balance
          const balanceRef = doc(db, 'balances', transaction.userId);
          const balanceDoc = await getDoc(balanceRef);

          let currentBalance = 0;
          if (balanceDoc.exists()) {
            currentBalance = balanceDoc.data().currentBalance || 0;
          }

          // Calculate new balance
          let newBalance = currentBalance;
          if (transaction.type === 'deposit') {
            newBalance += Number(finalAmount);
          } else if (transaction.type === 'withdraw') {
            newBalance -= Number(finalAmount);

            // Validate withdrawal
            if (newBalance < 0) {
              throw new Error('Insufficient balance');
            }
          }

          // Update balance
          await setDoc(balanceRef, {
            currentBalance: newBalance,
            lastUpdated: serverTimestamp()
          }, { merge: true });

          // Verify update
          const updatedBalanceDoc = await getDoc(balanceRef);
        }

        return status;
      } catch (error) {
        console.error("Error updating transaction status:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Get user's current balance
    async getUserBalance(userId) {
      try {
        const balanceRef = doc(db, 'balances', userId);
        const balanceDoc = await getDoc(balanceRef);

        if (balanceDoc.exists()) {
          return balanceDoc.data().currentBalance || 0;
        } else {
          // Create a balance record if it doesn't exist
          await setDoc(balanceRef, {
            currentBalance: 0,
            lastUpdated: serverTimestamp()
          });
          return 0;
        }
      } catch (error) {
        console.error('Error getting user balance:', error);
        return 0;
      }
    },

    // Get transaction history for a user
    async getTransactionHistory(userId, filter = {}) {
      try {
        let q = query(
          collection(db, 'transactions'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        let transactions = [];

        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });

        // Filter di client-side jika ada filter type
        if (filter.type) {
          transactions = transactions.filter(t => t.type === filter.type);
        }

        return transactions;
      } catch (error) {
        // Handle error
      }
    },

    // Get pending transactions for admin
    async getPendingTransactions() {
      this.loading = true;
      this.error = null;

      try {
        const q = query(
          collection(db, 'transactions'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const pendingTransactions = [];

        querySnapshot.forEach((doc) => {
          pendingTransactions.push({ id: doc.id, ...doc.data() });
        });

        this.pendingTransactions = pendingTransactions;
        return pendingTransactions;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});