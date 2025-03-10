<template>
  <MemberLayout>
    <div class="deposit-page">
      <div class="page-header">
        <h1>Tambah Tabungan</h1>
        <p>Mohon mengisi jumlah tabungan yang ingin Anda setorkan.</p>
      </div>

      <div class="deposit-card">
        <form @submit.prevent="submitDeposit">
          <div class="form-group">
            <label for="amount">Jumlah Tabungan</label>
            <div class="input-amount">
              <span class="currency-prefix">Rp</span>
              <input id="amount" v-model="amount" type="text" required placeholder="0" @input="formatAmount"
                ref="amountInput" />
            </div>
            <div class="amount-hint" v-if="amountInWords">{{ amountInWords }}</div>
          </div>

          <div class="form-group">
            <label for="notes">Catatan (Opsional)</label>
            <textarea id="notes" v-model="notes" rows="3"
              placeholder="Tambahkan catatan untuk tabungan ini..."></textarea>
          </div>

          <div class="deposit-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>Tabungan Anda akan diproses setelah mendapatkan persetujuan dari admin.</p>
          </div>

          <div class="form-actions">
            <router-link to="/member" class="btn btn-secondary">
              Batal
            </router-link>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isValidAmount">
              <span v-if="isSubmitting">
                <span class="loading-spinner"></span>
                Memproses...
              </span>
              <span v-else>Kirim Permintaan</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Recent deposits section -->
      <div class="recent-deposits" v-if="recentDeposits.length > 0">
        <h2>Tabungan Terbaru</h2>

        <div class="deposits-list">
          <div v-for="deposit in recentDeposits" :key="deposit.id" class="deposit-item"
            :class="{ 'pending': deposit.status === 'pending' }">
            <div class="deposit-header">
              <div class="deposit-info">
                <h3>Rp {{ formatCurrency(deposit.amount) }}</h3>
                <span class="deposit-date">{{ formatDate(deposit.createdAt) }}</span>
              </div>
              <div class="deposit-status" :class="deposit.status">
                {{ formatStatus(deposit.status) }}
              </div>
            </div>

            <div class="deposit-notes" v-if="deposit.notes">
              <p>{{ deposit.notes }}</p>
            </div>

            <div class="admin-notes" v-if="deposit.adminNotes">
              <strong>Catatan Admin:</strong>
              <p>{{ deposit.adminNotes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MemberLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MemberLayout from '../../layouts/MemberLayout.vue';
import { useAuthStore } from '../../stores/auth';
import { useTransactionStore } from '../../stores/transaction';

const router = useRouter();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

// State
const amount = ref('');
const notes = ref('');
const isSubmitting = ref(false);
const recentDeposits = ref([]);
const amountInput = ref(null);

// Computed
const amountInWords = computed(() => {
  if (!amount.value) return '';

  // Convert to number by removing non-numeric characters
  const numericValue = parseInt(amount.value.replace(/\D/g, ''));

  if (isNaN(numericValue) || numericValue === 0) return '';

  try {
    // Simple function to convert to words (can be improved for more complex cases)
    return 'Terbilang: ' + convertToWords(numericValue) + ' rupiah';
  } catch (error) {
    console.error('Error converting to words:', error);
    return '';
  }
});

const isValidAmount = computed(() => {
  if (!amount.value) return false;

  // Convert to number by removing non-numeric characters
  const numericValue = parseInt(amount.value.replace(/\D/g, ''));

  return !isNaN(numericValue) && numericValue > 0;
});

// Methods
const formatAmount = () => {
  // Remove non-numeric characters
  let value = amount.value.replace(/\D/g, '');

  // Format with thousand separator
  if (value) {
    value = parseInt(value).toLocaleString('id-ID');
  }

  amount.value = value;
};

const formatCurrency = (value) => {
  return parseInt(value).toLocaleString('id-ID');
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

const submitDeposit = async () => {
  if (!isValidAmount.value) {
    window.showNotification('Mohon masukkan jumlah tabungan yang valid', 'error');
    amountInput.value.focus();
    return;
  }

  isSubmitting.value = true;

  try {
    // Convert formatted string to number
    const numericAmount = parseInt(amount.value.replace(/\D/g, ''));

    await transactionStore.createTransaction({
      amount: numericAmount,
      type: 'deposit',
      notes: notes.value
    });

    window.showNotification('Permintaan tabungan berhasil dikirim', 'success');

    // Reset form
    amount.value = '';
    notes.value = '';

    // Reload recent deposits
    loadRecentDeposits();
  } catch (error) {
    console.error('Error submitting deposit:', error);
    window.showNotification('Gagal mengirim permintaan: ' + error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const loadRecentDeposits = async () => {
  if (!authStore.user) return;

  try {
    // Get recent deposit transactions
    const transactions = await transactionStore.getTransactionHistory(authStore.user.uid, {
      type: 'deposit'
    });

    // Show only the 5 most recent
    recentDeposits.value = transactions.slice(0, 5);
  } catch (error) {
    console.error('Error loading recent deposits:', error);
  }
};

// Convert number to words (basic implementation)
const convertToWords = (num) => {
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
  const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];

  const convert = (n) => {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000) return (n < 200 ? 'seratus' : units[Math.floor(n / 100)] + ' ratus') + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 1000000) return (n < 2000 ? 'seribu' : convert(Math.floor(n / 1000)) + ' ribu') + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' juta' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
    return convert(Math.floor(n / 1000000000)) + ' milyar' + (n % 1000000000 !== 0 ? ' ' + convert(n % 1000000000) : '');
  };

  return convert(num);
};

// Lifecycle hooks
onMounted(() => {
  loadRecentDeposits();
  amountInput.value?.focus();
});
</script>

<style scoped>
.deposit-page {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.page-header p {
  color: #6b7280;
}

.deposit-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
}

.input-amount {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.input-amount:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.currency-prefix {
  padding: 12px 16px;
  background-color: #f9fafb;
  border-right: 1px solid #d1d5db;
  font-weight: 500;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-amount input {
  border: none;
  flex: 1;
  padding: 12px 16px;
  font-size: 1.1rem;
  font-weight: 500;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.amount-hint {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #6b7280;
  font-style: italic;
}

.deposit-note {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 24px;
}

.deposit-note svg {
  flex-shrink: 0;
  color: #6b7280;
}

.deposit-note p {
  font-size: 0.9rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: var(--text-color);
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.loading-spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Recent deposits section */
.recent-deposits {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-deposits h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color);
}

.deposits-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deposit-item {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.deposit-item.pending {
  border-left-color: #f59e0b;
}

.deposit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.deposit-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.deposit-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.deposit-status {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.deposit-status.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.deposit-status.approved {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.deposit-status.rejected {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.deposit-notes,
.admin-notes {
  font-size: 0.9rem;
  margin-top: 8px;
}

.admin-notes {
  padding-top: 8px;
  border-top: 1px dashed #e5e7eb;
  margin-top: 12px;
  color: #6b7280;
}

.admin-notes strong {
  color: var(--text-color);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>