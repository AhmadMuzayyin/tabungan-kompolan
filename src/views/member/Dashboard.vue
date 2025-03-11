<template>
  <MemberLayout>
    <div class="dashboard">
      <!-- Balance card -->
      <div class="balance-card">
        <div class="balance-header">
          <h2>Saldo Tabungan</h2>
          <div class="balance-period">
            <select v-model="period" @change="loadBalanceData">
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>
        </div>

        <div class="balance-amount">
          <h3>Rp {{ formatCurrency(currentBalance) }}</h3>
          <span class="balance-update">Update terakhir: {{ lastUpdate }}</span>
        </div>

        <div class="balance-actions">
          <router-link to="/member/deposit" class="action-button deposit">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tabung
          </router-link>

          <router-link to="/member/withdraw" class="action-button withdraw">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tarik
          </router-link>
        </div>
      </div>

      <!-- Recent transactions -->
      <div class="recent-transactions">
        <h2>Transaksi Terbaru</h2>

        <div v-if="loading" class="transactions-loading">
          <div class="loading-spinner"></div>
          <span>Memuat transaksi...</span>
        </div>

        <div v-else-if="transactions.length === 0" class="transactions-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          <p>Belum ada transaksi</p>
          <router-link to="/member/deposit" class="empty-action">Mulai Menabung</router-link>
        </div>

        <div v-else class="transactions-list">
          <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-icon" :class="transaction.type">
              <svg v-if="transaction.type === 'deposit'" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>

            <div class="transaction-info">
              <div class="transaction-header">
                <h3>{{ transaction.type === 'deposit' ? 'Tabungan' : 'Penarikan' }}</h3>
                <span class="transaction-date">{{ formatDate(transaction.createdAt) }}</span>
              </div>
              <div class="transaction-details">
                <span class="transaction-amount">
                  {{ transaction.type === 'deposit' ? '+' : '-' }} Rp {{ formatCurrency(transaction.amount) }}
                </span>
                <span class="transaction-status" :class="transaction.status">
                  {{ formatStatus(transaction.status) }}
                </span>
              </div>
              <div class="transaction-notes" v-if="transaction.notes">
                <span>{{ transaction.notes }}</span>
              </div>
            </div>
          </div>

          <router-link to="/member/history" class="view-all-link">
            Lihat Semua Transaksi
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </MemberLayout>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import MemberLayout from '../../layouts/MemberLayout.vue';
import { useAuthStore } from '../../stores/auth';
import { useTransactionStore } from '../../stores/transaction';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();

// State
const currentBalance = ref(0);
const lastUpdate = ref('');
const period = ref('monthly');
const loading = ref(true);
const transactions = ref([]);
const balanceListener = ref(null);

// Computed
const formatStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    default:
      return status;
  }
};

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const loadBalanceData = async () => {
  if (!authStore.user) return;

  try {
    // Get current balance
    currentBalance.value = await transactionStore.getUserBalance(authStore.user.uid);

    // Set last update time
    lastUpdate.value = formatDate(new Date());
  } catch (error) {
    console.error('Error loading balance:', error);
    window.showNotification('Gagal memuat data saldo', 'error');
  }
};

const loadRecentTransactions = async () => {
  if (!authStore.user) return;

  loading.value = true;

  try {
    // Get recent transactions (limit to 5)
    const allTransactions = await transactionStore.getTransactionHistory(authStore.user.uid);
    transactions.value = allTransactions.slice(0, 5);
  } catch (error) {
    console.error('Error loading transactions:', error);
    window.showNotification('Gagal memuat transaksi terbaru', 'error');
  } finally {
    loading.value = false;
  }
};
const subscribeToBalance = async () => {
  if (!authStore.user) return;

  // Unsubscribe jika sudah ada listener
  if (balanceListener.value) {
    balanceListener.value();
  }

  const balanceRef = doc(db, 'balances', authStore.user.uid);
  balanceListener.value = onSnapshot(balanceRef, (doc) => {
    if (doc.exists()) {
      currentBalance.value = doc.data().currentBalance || 0;
      lastUpdate.value = formatDate(doc.data().lastUpdated || new Date());
    } else {
      currentBalance.value = 0;
    }
  });
};
// Lifecycle hooks
onMounted(async () => {
  if (authStore.user) {
    await loadBalanceData();
    await loadRecentTransactions();

    // Subscribe to user's transactions
    transactionStore.subscribeToUserTransactions(authStore.user.uid);
    subscribeToBalance();
  }
});
onBeforeUnmount(() => {
  if (balanceListener.value) {
    balanceListener.value();
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Balance Card */
.balance-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.balance-period select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.balance-amount {
  margin-bottom: 24px;
}

.balance-amount h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.balance-update {
  font-size: 0.8rem;
  color: #6b7280;
}

.balance-actions {
  display: flex;
  gap: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  flex: 1;
  transition: background-color 0.2s;
}

.action-button.deposit {
  background-color: var(--primary-color);
  color: white;
}

.action-button.deposit:hover {
  background-color: #4338ca;
}

.action-button.withdraw {
  background-color: white;
  color: var(--text-color);
  border: 1px solid #e5e7eb;
}

.action-button.withdraw:hover {
  background-color: #f9fafb;
}

/* Recent Transactions */
.recent-transactions {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-transactions h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
}

.transactions-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #6b7280;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.transactions-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #6b7280;
}

.transactions-empty svg {
  margin-bottom: 16px;
  color: #d1d5db;
}

.transactions-empty p {
  margin-bottom: 16px;
}

.empty-action {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.empty-action:hover {
  background-color: #4338ca;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  display: flex;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.transaction-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.transaction-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.transaction-icon.deposit {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.transaction-icon.withdraw {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-header h3 {
  font-size: 1rem;
  font-weight: 500;
}

.transaction-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.transaction-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-amount {
  font-weight: 600;
}

.transaction-status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
}

.transaction-status.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.transaction-status.approved {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.transaction-status.rejected {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.transaction-notes {
  font-size: 0.85rem;
  color: #6b7280;
}

.view-all-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 0;
  margin-top: 8px;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #4338ca;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .balance-amount h3 {
    font-size: 1.5rem;
  }

  .action-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>