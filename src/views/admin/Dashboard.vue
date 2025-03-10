<template>
  <AdminLayout title="Dashboard">
    <div class="dashboard">
      <!-- Stats cards -->
      <div class="stats-container">
        <div class="stats-card">
          <div class="stats-icon members">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stats-content">
            <h3>Total Anggota</h3>
            <div class="stats-value">{{ stats.totalMembers }}</div>
          </div>
        </div>

        <div class="stats-card">
          <div class="stats-icon balance">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="stats-content">
            <h3>Total Tabungan</h3>
            <div class="stats-value">Rp {{ formatCurrency(stats.totalBalance) }}</div>
          </div>
        </div>

        <div class="stats-card">
          <div class="stats-icon transactions">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          </div>
          <div class="stats-content">
            <h3>Transaksi Bulan Ini</h3>
            <div class="stats-value">{{ stats.monthlyTransactions }}</div>
          </div>
        </div>

        <div class="stats-card">
          <div class="stats-icon pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stats-content">
            <h3>Menunggu Approval</h3>
            <div class="stats-value">{{ stats.pendingCount }}</div>
            <router-link to="/admin/approvals" class="stats-link" v-if="stats.pendingCount > 0">
              Lihat Semua
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Charts section -->
      <div class="charts-container">
        <div class="chart-card">
          <div class="card-header">
            <h3>Transaksi Bulan Ini</h3>
            <div class="card-actions">
              <select v-model="transactionPeriod" @change="loadChartData">
                <option value="week">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
                <option value="quarter">3 Bulan Terakhir</option>
              </select>
            </div>
          </div>

          <div class="chart-content">
            <canvas ref="transactionsChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="card-header">
            <h3>Perbandingan Tabungan vs Penarikan</h3>
            <div class="card-actions">
              <select v-model="comparisonPeriod" @change="loadChartData">
                <option value="month">Bulan Ini</option>
                <option value="quarter">3 Bulan Terakhir</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>
          </div>

          <div class="chart-content">
            <canvas ref="comparisonChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent activities section -->
      <div class="activities-container">
        <div class="card-header">
          <h3>Aktivitas Terbaru</h3>
          <button @click="refreshActivities" class="refresh-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
            </svg>
            Refresh
          </button>
        </div>

        <div class="activities-list">
          <div v-if="activities.length === 0" class="empty-activities">
            <p>Tidak ada aktivitas terbaru</p>
          </div>

          <div v-else class="activity-timeline">
            <div v-for="(activity, index) in activities" :key="index" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <svg v-if="activity.type === 'deposit'" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="M12 5v14"></path>
                  <path d="M19 12l-7-7-7 7"></path>
                </svg>
                <svg v-else-if="activity.type === 'withdraw'" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="M12 19V5"></path>
                  <path d="M5 12l7 7 7-7"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <div class="activity-content">
                <p class="activity-text" v-html="activity.text"></p>
                <span class="activity-time">{{ formatDate(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import AdminLayout from '../../layouts/AdminLayout.vue';
import { useAuthStore } from '../../stores/auth';
import { useTransactionStore } from '../../stores/transaction';
import { db } from '../../firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import Chart from 'chart.js/auto';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

const endOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};
// State
const stats = ref({
  totalMembers: 0,
  totalBalance: 0,
  monthlyTransactions: 0,
  pendingCount: 0
});

const activities = ref([]);
const transactionPeriod = ref('month');
const comparisonPeriod = ref('month');

// Chart references
const transactionsChart = ref(null);
const comparisonChart = ref(null);

// Chart instances
let transactionsChartInstance = null;
let comparisonChartInstance = null;

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // difference in seconds

  if (diff < 60) {
    return 'Baru saja';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} menit yang lalu`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} jam yang lalu`;
  } else if (diff < 172800) {
    return 'Kemarin';
  } else {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
};

const loadStats = async () => {
  try {
    // Get total members
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'member')
    );
    const usersSnapshot = await getDocs(usersQuery);
    stats.value.totalMembers = usersSnapshot.size;

    // Get total balance
    const balancesQuery = query(collection(db, 'balances'));
    const balancesSnapshot = await getDocs(balancesQuery);

    let totalBalance = 0;
    balancesSnapshot.forEach(doc => {
      totalBalance += doc.data().currentBalance || 0;
    });

    stats.value.totalBalance = totalBalance;

    // Get monthly transactions count
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', firstDayOfMonth)
    );

    const transactionsSnapshot = await getDocs(transactionsQuery);
    stats.value.monthlyTransactions = transactionsSnapshot.size;

    // Get pending count from store
    stats.value.pendingCount = transactionStore.pendingTransactions.length;
  } catch (error) {
    console.error('Error loading stats:', error);
    window.showNotification('Gagal memuat statistik', 'error');
  }
};

const loadActivities = async () => {
  try {
    // Get recent transactions
    const recentTransactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const transactionsSnapshot = await getDocs(recentTransactionsQuery);

    const newActivities = [];

    transactionsSnapshot.forEach(doc => {
      const transaction = { id: doc.id, ...doc.data() };

      let text = '';
      if (transaction.status === 'pending') {
        text = `<strong>${transaction.userName}</strong> meminta ${transaction.type === 'deposit' ? 'tabungan' : 'penarikan'} sebesar <strong>Rp ${formatCurrency(transaction.amount)}</strong>`;
      } else if (transaction.status === 'approved') {
        text = `<strong>${transaction.approverName || 'Admin'}</strong> menyetujui ${transaction.type === 'deposit' ? 'tabungan' : 'penarikan'} <strong>${transaction.userName}</strong> sebesar <strong>Rp ${formatCurrency(transaction.amount)}</strong>`;
      } else if (transaction.status === 'rejected') {
        text = `<strong>${transaction.approverName || 'Admin'}</strong> menolak ${transaction.type === 'deposit' ? 'tabungan' : 'penarikan'} <strong>${transaction.userName}</strong> sebesar <strong>Rp ${formatCurrency(transaction.amount)}</strong>`;
      }

      newActivities.push({
        type: transaction.type,
        text,
        timestamp: transaction.createdAt
      });
    });

    activities.value = newActivities;
  } catch (error) {
    console.error('Error loading activities:', error);
    window.showNotification('Gagal memuat aktivitas terbaru', 'error');
  }
};

const refreshActivities = async () => {
  await loadActivities();
  window.showNotification('Aktivitas terbaru diperbarui', 'success');
};

const loadChartData = async () => {
  await initializeTransactionsChart();
  await initializeComparisonChart();
};

const initializeTransactionsChart = async () => {
  try {
    // Clear previous chart if exists
    if (transactionsChartInstance) {
      transactionsChartInstance.destroy();
    }

    // Define time period
    const now = new Date();
    let startDate;

    if (transactionPeriod.value === 'week') {
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (transactionPeriod.value === 'month') {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (transactionPeriod.value === 'quarter') {
      // Last 3 months
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
    }

    // Get transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', startDate),
      where('status', '==', 'approved'),
    );

    const result = await getDocs(transactionsQuery);
    const items = [];
    result.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    // Urutkan di client
    items.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA - dateB; // ascending
    });

    const transactionsSnapshot = await getDocs(transactionsQuery);

    // Process data
    const transactionsByDate = {};

    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      const date = transaction.createdAt.toDate();
      const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];

      if (!transactionsByDate[dateKey]) {
        transactionsByDate[dateKey] = {
          deposits: 0,
          withdrawals: 0
        };
      }

      if (transaction.type === 'deposit') {
        transactionsByDate[dateKey].deposits += 1;
      } else if (transaction.type === 'withdraw') {
        transactionsByDate[dateKey].withdrawals += 1;
      }
    });

    // Generate labels (dates)
    const labels = [];
    const depositData = [];
    const withdrawalData = [];

    // Generate all dates in the period
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      labels.push(new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(currentDate));

      depositData.push(transactionsByDate[dateKey]?.deposits || 0);
      withdrawalData.push(transactionsByDate[dateKey]?.withdrawals || 0);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create chart
    const ctx = transactionsChart.value.getContext('2d');

    transactionsChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Tabungan',
            data: depositData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Penarikan',
            data: withdrawalData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing transactions chart:', error);
  }
};

const initializeComparisonChart = async () => {
  try {
    // Clear previous chart if exists
    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
    }

    // Define time period
    const now = new Date();
    let startDate;

    if (comparisonPeriod.value === 'month') {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (comparisonPeriod.value === 'quarter') {
      // Last 3 months
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
    } else if (comparisonPeriod.value === 'year') {
      // Current year
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Get transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', startDate),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'asc')
    );

    const transactionsSnapshot = await getDocs(transactionsQuery);

    // Process data
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data();

      if (transaction.type === 'deposit') {
        totalDeposits += transaction.amount;
      } else if (transaction.type === 'withdraw') {
        totalWithdrawals += transaction.amount;
      }
    });

    // Create chart
    const ctx = comparisonChart.value.getContext('2d');

    comparisonChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Tabungan', 'Penarikan'],
        datasets: [{
          data: [totalDeposits, totalWithdrawals],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            '#10b981',
            '#ef4444'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw;
                return `${label}: Rp ${formatCurrency(value)}`;
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing comparison chart:', error);
  }
};

// Watchers
watch(() => transactionStore.pendingTransactions, (newValue) => {
  stats.value.pendingCount = newValue.length;
}, { deep: true });

// Lifecycle hooks
onMounted(async () => {
  // Load initial data
  await loadStats();
  await loadActivities();
  await loadChartData();

  // Subscribe to pending transactions
  if (authStore.isAdmin) {
    transactionStore.subscribeToPendingTransactions();
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Stats cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stats-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-icon.members {
  background-color: rgba(79, 70, 229, 0.1);
  color: var(--primary-color);
}

.stats-icon.balance {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stats-icon.transactions {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stats-icon.pending {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stats-content {
  flex: 1;
  min-width: 0;
}

.stats-content h3 {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 6px;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.stats-link {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s;
}

.stats-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

/* Charts section */
.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.card-actions select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.chart-content {
  height: 300px;
  position: relative;
}

/* Activities section */
.activities-container {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background-color: #f3f4f6;
  color: var(--text-color);
}

.activities-list {
  margin-top: 16px;
}

.empty-activities {
  padding: 32px 0;
  text-align: center;
  color: #6b7280;
}

.activity-timeline {
  position: relative;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 9px;
  width: 2px;
  background-color: #e5e7eb;
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  position: relative;
}

.activity-icon {
  margin-left: 30px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.activity-icon.deposit {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.activity-icon.withdraw {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin-bottom: 4px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.activity-time {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .stats-value {
    font-size: 1.3rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>