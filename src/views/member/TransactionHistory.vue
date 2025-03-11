<template>
  <MemberLayout>
    <div class="history-page">
      <div class="page-header">
        <h1>Riwayat Transaksi</h1>
        <div class="header-actions">
          <div class="filter-group">
            <select v-model="typeFilter" @change="applyFilters">
              <option value="all">Semua Jenis</option>
              <option value="deposit">Tabungan</option>
              <option value="withdraw">Penarikan</option>
            </select>

            <select v-model="statusFilter" @change="applyFilters">
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>

            <select v-model="timeFilter" @change="applyFilters">
              <option value="all">Kapan Saja</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>

          <button class="btn-icon" @click="refreshTransactions" title="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Transactions list -->
      <div class="transactions-container">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Memuat transaksi...</p>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Tidak ada transaksi ditemukan</p>
          <button class="btn" @click="resetFilters">Reset Filter</button>
        </div>

        <div v-else class="transactions-list">
          <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-card"
            :class="[transaction.type, transaction.status]">
            <div class="transaction-header">
              <div class="transaction-type-badge" :class="transaction.type">
                {{ transaction.type === 'deposit' ? 'Tabungan' : 'Penarikan' }}
              </div>
              <div class="transaction-date">
                {{ formatDate(transaction.createdAt) }}
              </div>
            </div>

            <div class="transaction-body">
              <div class="transaction-amount">
                <span class="amount-prefix">{{ transaction.type === 'deposit' ? '+' : '-' }} Rp</span>
                {{ formatCurrency(transaction.amount) }}
              </div>

              <div class="transaction-status" :class="transaction.status">
                {{ formatStatus(transaction.status) }}
              </div>
            </div>

            <div class="transaction-info">
              <div class="info-item" v-if="transaction.notes">
                <span class="info-label">Catatan:</span>
                <span class="info-value">{{ transaction.notes }}</span>
              </div>

              <div class="info-item" v-if="transaction.adminNotes">
                <span class="info-label">Catatan Admin:</span>
                <span class="info-value">{{ transaction.adminNotes }}</span>
              </div>

              <div class="info-item" v-if="transaction.status !== 'pending'">
                <span class="info-label">Diproses Oleh:</span>
                <span class="info-value">{{ transaction.approverName || 'Admin' }}</span>
              </div>

              <div class="info-item" v-if="transaction.updatedAt && transaction.status !== 'pending'">
                <span class="info-label">Diproses Pada:</span>
                <span class="info-value">{{ formatDate(transaction.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="prevPage">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <span class="pagination-info">{{ currentPage }} dari {{ totalPages }}</span>

          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="nextPage">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </MemberLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MemberLayout from '../../layouts/MemberLayout.vue';
import { useAuthStore } from '../../stores/auth';
import { useTransactionStore } from '../../stores/transaction';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();

// State
const transactions = ref([]);
const loading = ref(true);
const typeFilter = ref('all');
const statusFilter = ref('all');
const timeFilter = ref('all');
const currentPage = ref(1);
const itemsPerPage = 10;

// Computed
const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(t => t.type === typeFilter.value);
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter.value);
  }

  // Apply time filter
  if (timeFilter.value !== 'all') {
    const now = new Date();
    let startDate;

    if (timeFilter.value === 'week') {
      // Start of week (Sunday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter.value === 'month') {
      // Start of month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter.value === 'year') {
      // Start of year
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    filtered = filtered.filter(t => {
      const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      return transactionDate >= startDate;
    });
  }

  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return filtered.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  if (transactions.value.length === 0) return 1;

  let filtered = [...transactions.value];

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(t => t.type === typeFilter.value);
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter.value);
  }

  // Apply time filter
  if (timeFilter.value !== 'all') {
    const now = new Date();
    let startDate;

    if (timeFilter.value === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter.value === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter.value === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    filtered = filtered.filter(t => {
      const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      return transactionDate >= startDate;
    });
  }

  return Math.ceil(filtered.length / itemsPerPage);
});

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

const loadTransactions = async () => {
  if (!authStore.user) return;

  loading.value = true;

  try {
    const allTransactions = await transactionStore.getTransactionHistory(authStore.user.uid);

    // Sort transactions by date (newest first)
    transactions.value = allTransactions.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error loading transactions:', error);
    window.showNotification('Gagal memuat riwayat transaksi', 'error');
  } finally {
    loading.value = false;
  }
};

const refreshTransactions = async () => {
  await loadTransactions();
  window.showNotification('Riwayat transaksi diperbarui', 'success');
};

const applyFilters = () => {
  // Reset to first page when filters change
  currentPage.value = 1;
};

const resetFilters = () => {
  typeFilter.value = 'all';
  statusFilter.value = 'all';
  timeFilter.value = 'all';
  currentPage.value = 1;
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Lifecycle hooks
onMounted(async () => {
  if (authStore.user) {
    await loadTransactions();

    // Subscribe to user's transactions for realtime updates
    transactionStore.subscribeToUserTransactions(authStore.user.uid);
  }
});
</script>

<style scoped>
.history-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: white;
  border: 1px solid #d1d5db;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f3f4f6;
}

/* Transactions container */
.transactions-container {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #6b7280;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #6b7280;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-state p {
  margin-bottom: 16px;
}

.empty-state .btn {
  padding: 8px 16px;
  background-color: white;
  color: var(--primary-color);
  border: 1px solid currentColor;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-state .btn:hover {
  background-color: #f9fafb;
}

/* Transaction cards */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-card {
  border-radius: 8px;
  background-color: #f9fafb;
  padding: 16px;
  border-left: 4px solid #d1d5db;
}

.transaction-card.deposit {
  border-left-color: #10b981;
}

.transaction-card.withdraw {
  border-left-color: #ef4444;
}

.transaction-card.pending {
  border-left-color: #f59e0b;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.transaction-type-badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.transaction-type-badge.deposit {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.transaction-type-badge.withdraw {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.transaction-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.transaction-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.transaction-amount {
  font-size: 1.3rem;
  font-weight: 600;
}

.amount-prefix {
  font-weight: normal;
  font-size: 1rem;
}

.transaction-status {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
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

.transaction-info {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  font-size: 0.85rem;
  display: flex;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  min-width: 100px;
  color: #4b5563;
}

.info-value {
  color: #6b7280;
  flex: 1;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: white;
  border: 1px solid #d1d5db;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    flex: 1;
  }

  .btn-icon {
    align-self: flex-end;
    margin-top: 10px;
  }

  .transaction-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>