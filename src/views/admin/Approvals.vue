<template>
  <AdminLayout title="Persetujuan Transaksi">
    <div class="approvals-page">
      <!-- Filters & actions -->
      <div class="filters-container">
        <div class="filters">
          <select v-model="typeFilter" @change="applyFilters">
            <option value="all">Semua Jenis</option>
            <option value="deposit">Tabungan</option>
            <option value="withdraw">Penarikan</option>
          </select>

          <select v-model="sortOrder" @change="applyFilters">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="amount-high">Jumlah (Tinggi ke Rendah)</option>
            <option value="amount-low">Jumlah (Rendah ke Tinggi)</option>
          </select>
        </div>

        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Cari nama anggota..." v-model="searchQuery" @input="applyFilters" />
        </div>
      </div>

      <!-- Transactions list -->
      <div class="transactions-container">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Memuat transaksi...</p>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <h3>Tidak ada transaksi yang menunggu persetujuan</h3>
          <p>Semua transaksi sudah diproses atau belum ada permintaan baru.</p>
        </div>

        <div v-else class="transactions-grid">
          <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-card"
            :class="transaction.type">
            <div class="transaction-header">
              <div class="user-info">
                <div class="user-avatar">
                  <span>{{ getInitials(transaction.userName) }}</span>
                </div>
                <div class="user-details">
                  <h3>{{ transaction.userName }}</h3>
                  <span class="transaction-date">{{ formatDate(transaction.createdAt) }}</span>
                </div>
              </div>
              <div class="transaction-badge" :class="transaction.type">
                {{ transaction.type === 'deposit' ? 'Tabungan' : 'Penarikan' }}
              </div>
            </div>

            <div class="transaction-body">
              <div class="transaction-amount">
                <span>Rp {{ formatCurrency(transaction.amount) }}</span>
              </div>

              <div class="transaction-notes" v-if="transaction.notes">
                <div class="notes-label">Catatan:</div>
                <div class="notes-content">{{ transaction.notes }}</div>
              </div>

              <div class="transaction-actions">
                <button class="approve-btn" @click="showApproveModal(transaction)"
                  :disabled="transaction.id === currentTransaction?.id && isProcessing">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Setujui
                </button>

                <button class="reject-btn" @click="showRejectModal(transaction)"
                  :disabled="transaction.id === currentTransaction?.id && isProcessing">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Approval modal -->
      <div class="modal" v-if="showModal">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ modalType === 'approve' ? 'Setujui Transaksi' : 'Tolak Transaksi' }}</h3>
            <button class="close-btn" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="transaction-summary">
              <div class="summary-item">
                <span class="summary-label">Jenis Transaksi:</span>
                <span class="summary-value">{{ currentTransaction?.type === 'deposit' ? 'Tabungan' : 'Penarikan'
                  }}</span>
              </div>

              <div class="summary-item">
                <span class="summary-label">Anggota:</span>
                <span class="summary-value">{{ currentTransaction?.userName }}</span>
              </div>

              <div class="summary-item">
                <span class="summary-label">Jumlah:</span>
                <span class="summary-value">Rp {{ formatCurrency(currentTransaction?.amount || 0) }}</span>
              </div>

              <div class="summary-item">
                <span class="summary-label">Tanggal Permintaan:</span>
                <span class="summary-value">{{ formatDate(currentTransaction?.createdAt) }}</span>
              </div>

              <div class="summary-item" v-if="currentTransaction?.notes">
                <span class="summary-label">Catatan Anggota:</span>
                <span class="summary-value">{{ currentTransaction?.notes }}</span>
              </div>
            </div>

            <div class="admin-notes">
              <label for="adminNotes">Catatan Admin (Opsional):</label>
              <textarea id="adminNotes" v-model="adminNotes" rows="3"
                :placeholder="modalType === 'approve' ? 'Tambahkan catatan untuk persetujuan ini...' : 'Berikan alasan penolakan...'"></textarea>
            </div>

            <div v-if="modalType === 'reject'" class="warning-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z">
                </path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p>Transaksi yang sudah ditolak tidak dapat disetujui kembali.</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeModal" :disabled="isProcessing">Batal</button>
            <button v-if="modalType === 'approve'" class="approve-btn" @click="approveTransaction"
              :disabled="isProcessing">
              <span v-if="isProcessing" class="loading-spinner small"></span>
              {{ isProcessing ? 'Memproses...' : 'Setujui Transaksi' }}
            </button>
            <button v-else class="reject-btn" @click="rejectTransaction" :disabled="isProcessing">
              <span v-if="isProcessing" class="loading-spinner small"></span>
              {{ isProcessing ? 'Memproses...' : 'Tolak Transaksi' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import AdminLayout from '../../layouts/AdminLayout.vue';
import { useAuthStore } from '../../stores/auth';
import { useTransactionStore } from '../../stores/transaction';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();

// State
const loading = ref(true);
const transactions = ref([]);
const typeFilter = ref('all');
const sortOrder = ref('newest');
const searchQuery = ref('');
const showModal = ref(false);
const modalType = ref('approve'); // 'approve' or 'reject'
const currentTransaction = ref(null);
const adminNotes = ref('');
const isProcessing = ref(false);

// Computed
const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(t => t.type === typeFilter.value);
  }

  // Apply search filter
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(t =>
      t.userName?.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  if (sortOrder.value === 'newest') {
    filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
  } else if (sortOrder.value === 'oldest') {
    filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA - dateB;
    });
  } else if (sortOrder.value === 'amount-high') {
    filtered.sort((a, b) => b.amount - a.amount);
  } else if (sortOrder.value === 'amount-low') {
    filtered.sort((a, b) => a.amount - b.amount);
  }

  return filtered;
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

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const applyFilters = () => {
  // This is a no-op function as the filtering is handled by the computed property
  // But we keep it for clarity in the template
};

const loadTransactions = async () => {
  loading.value = true;

  try {
    const pendingTransactions = await transactionStore.getPendingTransactions();
    transactions.value = pendingTransactions;
  } catch (error) {
    console.error('Error loading transactions:', error);
    window.showNotification('Gagal memuat data transaksi', 'error');
  } finally {
    loading.value = false;
  }
};

const showApproveModal = (transaction) => {
  currentTransaction.value = transaction;
  modalType.value = 'approve';
  adminNotes.value = '';
  showModal.value = true;
};

const showRejectModal = (transaction) => {
  currentTransaction.value = transaction;
  modalType.value = 'reject';
  adminNotes.value = '';
  showModal.value = true;
};

const closeModal = () => {
  if (isProcessing.value) return;

  showModal.value = false;
  currentTransaction.value = null;
  adminNotes.value = '';
};

const approveTransaction = async () => {
  if (!currentTransaction.value || isProcessing.value) return;

  isProcessing.value = true;

  try {
    await transactionStore.updateTransactionStatus(
      currentTransaction.value.id,
      'approved',
      adminNotes.value
    );

    window.showNotification('Transaksi berhasil disetujui', 'success');

    // Remove from local list
    transactions.value = transactions.value.filter(t => t.id !== currentTransaction.value.id);

    closeModal();
  } catch (error) {
    console.error('Error approving transaction:', error);
    window.showNotification('Gagal menyetujui transaksi: ' + error.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

const rejectTransaction = async () => {
  if (!currentTransaction.value || isProcessing.value) return;

  isProcessing.value = true;

  try {
    await transactionStore.updateTransactionStatus(
      currentTransaction.value.id,
      'rejected',
      adminNotes.value
    );

    window.showNotification('Transaksi berhasil ditolak', 'success');

    // Remove from local list
    transactions.value = transactions.value.filter(t => t.id !== currentTransaction.value.id);

    closeModal();
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    window.showNotification('Gagal menolak transaksi: ' + error.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

// Watchers
watch(() => transactionStore.pendingTransactions, (newValue) => {
  transactions.value = [...newValue];
}, { deep: true });

// Lifecycle hooks
onMounted(async () => {
  await loadTransactions();

  // Subscribe to pending transactions for realtime updates
  if (authStore.isAdmin) {
    transactionStore.subscribeToPendingTransactions();
  }
});
</script>

<style scoped>
.approvals-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* Filters and search */
.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 12px;
}

.filters select {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: white;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  min-width: 180px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 16px;
  height: 42px;
  width: 300px;
  transition: box-shadow 0.2s;
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  padding: 4px 0;
  outline: none;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: #6b7280;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin-bottom: 0;
  margin-right: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: #6b7280;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.empty-state p {
  font-size: 0.95rem;
}

/* Transactions grid */
.transactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.transaction-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-top: 4px solid #d1d5db;
}

.transaction-card.deposit {
  border-top-color: #10b981;
}

.transaction-card.withdraw {
  border-top-color: #ef4444;
}

.transaction-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.transaction-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.transaction-badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.transaction-badge.deposit {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.transaction-badge.withdraw {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.transaction-body {
  padding: 16px;
}

.transaction-amount {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.transaction-notes {
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.notes-label {
  font-weight: 500;
  margin-bottom: 4px;
}

.notes-content {
  color: #6b7280;
  background-color: #f9fafb;
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
}

.transaction-actions {
  display: flex;
  gap: 12px;
}

.approve-btn,
.reject-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;
}

.approve-btn {
  background-color: #10b981;
  color: white;
}

.approve-btn:hover:not(:disabled) {
  background-color: #059669;
}

.reject-btn {
  background-color: #ef4444;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background-color: #dc2626;
}

.approve-btn:disabled,
.reject-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-container {
  position: relative;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 51;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-color);
}

.modal-body {
  padding: 16px;
}

.transaction-summary {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-weight: 500;
  color: #4b5563;
}

.admin-notes {
  margin-bottom: 16px;
}

.admin-notes label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
}

.admin-notes textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.admin-notes textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

.warning-message svg {
  flex-shrink: 0;
  color: #f59e0b;
  margin-top: 2px;
}

.warning-message p {
  font-size: 0.9rem;
  color: #7c2d12;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  background-color: white;
  border: 1px solid #d1d5db;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .transactions-grid {
    grid-template-columns: 1fr;
  }
}
</style>