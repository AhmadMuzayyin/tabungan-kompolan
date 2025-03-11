<template>
  <AdminLayout title="Manajemen Anggota">
    <div class="members-page">
      <!-- Header with actions -->
      <div class="page-actions">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Cari anggota..." v-model="searchQuery" />
        </div>

        <button class="add-btn" @click="showAddMemberModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span class="btn-text">Tambah Anggota</span>
        </button>
      </div>

      <!-- Members table -->
      <div class="members-container">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Memuat data anggota...</p>
        </div>

        <div v-else-if="filteredMembers.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>Belum ada anggota</h3>
          <p>Tambahkan anggota baru untuk mulai mengelola tabungan organisasi.</p>
        </div>

        <div v-else>
          <!-- Tampilan tabel untuk desktop -->
          <div class="table-responsive desktop-view">
            <table class="members-table">
              <thead>
                <tr>
                  <th>Anggota</th>
                  <th>Email</th>
                  <th>Tanggal Gabung</th>
                  <th>Saldo</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredMembers" :key="member.id">
                  <td>
                    <div class="member-info">
                      <div class="member-avatar">
                        <img v-if="member.photoURL" :src="member.photoURL" alt="Avatar" />
                        <span v-else>{{ getInitials(member.name) }}</span>
                      </div>
                      <div>
                        <div class="member-name">{{ member.name }}</div>
                        <div class="member-id">ID: {{ member.id.substring(0, 8) }}...</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ member.email }}</td>
                  <td>{{ formatDate(member.createdAt) }}</td>
                  <td>Rp {{ formatCurrency(member.balance) }}</td>
                  <td>
                    <span class="status-badge" :class="member.active ? 'active' : 'inactive'">
                      {{ member.active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="action-btn view" title="Lihat Detail" @click="viewMemberDetails(member)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>

                      <button class="action-btn edit" title="Edit Anggota" @click="editMember(member)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      <button v-if="member.active" class="action-btn deactivate" title="Nonaktifkan Anggota"
                        @click="deactivateMember(member)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                      </button>

                      <button v-else class="action-btn activate" title="Aktifkan Anggota"
                        @click="activateMember(member)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tampilan kartu untuk mobile -->
          <div class="mobile-view">
            <div v-for="member in filteredMembers" :key="member.id" class="member-card">
              <div class="member-card-header">
                <div class="member-info">
                  <div class="member-avatar">
                    <img v-if="member.photoURL" :src="member.photoURL" alt="Avatar" />
                    <span v-else>{{ getInitials(member.name) }}</span>
                  </div>
                  <div>
                    <div class="member-name">{{ member.name }}</div>
                    <div class="member-email">{{ member.email }}</div>
                  </div>
                </div>
                <span class="status-badge" :class="member.active ? 'active' : 'inactive'">
                  {{ member.active ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </div>

              <div class="member-card-body">
                <div class="member-detail">
                  <span class="detail-label">Tanggal Gabung:</span>
                  <span class="detail-value">{{ formatDate(member.createdAt) }}</span>
                </div>
                <div class="member-detail">
                  <span class="detail-label">Saldo:</span>
                  <span class="detail-value">Rp {{ formatCurrency(member.balance) }}</span>
                </div>
                <div class="member-detail">
                  <span class="detail-label">ID:</span>
                  <span class="detail-value">{{ member.id.substring(0, 8) }}...</span>
                </div>
              </div>

              <div class="member-card-footer">
                <button class="action-btn view" title="Lihat Detail" @click="viewMemberDetails(member)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>Detail</span>
                </button>

                <button class="action-btn edit" title="Edit Anggota" @click="editMember(member)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Edit</span>
                </button>

                <button v-if="member.active" class="action-btn deactivate" title="Nonaktifkan Anggota"
                  @click="deactivateMember(member)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <span>Nonaktifkan</span>
                </button>

                <button v-else class="action-btn activate" title="Aktifkan Anggota" @click="activateMember(member)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Aktifkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Member details modal -->
      <div class="modal" v-if="showDetailsModal">
        <div class="modal-overlay" @click="closeDetailsModal"></div>
        <div class="modal-container">
          <div class="modal-header">
            <h3>Detail Anggota</h3>
            <button class="close-btn" @click="closeDetailsModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="selectedMember" class="member-details">
              <div class="member-header">
                <div class="member-avatar large">
                  <img v-if="selectedMember.photoURL" :src="selectedMember.photoURL" alt="Avatar" />
                  <span v-else>{{ getInitials(selectedMember.name) }}</span>
                </div>
                <div class="member-header-info">
                  <h3>{{ selectedMember.name }}</h3>
                  <p>{{ selectedMember.email }}</p>
                  <div class="member-joined">
                    Bergabung: {{ formatDate(selectedMember.createdAt) }}
                  </div>
                </div>
              </div>

              <div class="member-stats">
                <div class="stat-card">
                  <div class="stat-title">Saldo Saat Ini</div>
                  <div class="stat-value">Rp {{ formatCurrency(selectedMember.balance) }}</div>
                </div>

                <div class="stat-card">
                  <div class="stat-title">Total Transaksi</div>
                  <div class="stat-value">{{ selectedMember.totalTransactions || 0 }}</div>
                </div>

                <div class="stat-card">
                  <div class="stat-title">Status</div>
                  <div class="stat-value">
                    <span class="status-badge" :class="selectedMember.active ? 'active' : 'inactive'">
                      {{ selectedMember.active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Riwayat Transaksi Terbaru</h4>
                <div v-if="memberTransactions.length === 0" class="empty-transactions">
                  <p>Belum ada transaksi</p>
                </div>
                <div v-else class="transactions-list">
                  <div v-for="transaction in memberTransactions" :key="transaction.id" class="transaction-item"
                    :class="transaction.type">
                    <div class="transaction-icon" :class="transaction.type">
                      <svg v-if="transaction.type === 'deposit'" xmlns="http://www.w3.org/2000/svg" width="16"
                        height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                      </svg>
                    </div>
                    <div class="transaction-details">
                      <div class="transaction-header">
                        <div class="transaction-type">
                          {{ transaction.type === 'deposit' ? 'Tabungan' : 'Penarikan' }}
                        </div>
                        <div class="transaction-date">
                          {{ formatDate(transaction.createdAt) }}
                        </div>
                      </div>
                      <div class="transaction-amount">
                        Rp {{ formatCurrency(transaction.amount) }}
                      </div>
                      <div class="transaction-status" :class="transaction.status">
                        {{ formatStatus(transaction.status) }}
                      </div>
                    </div>
                  </div>

                  <button class="view-all-btn" @click="viewAllTransactions">
                    Lihat Semua Transaksi
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit member modal -->
      <div class="modal" v-if="showMemberModal">
        <div class="modal-overlay" @click="closeMemberModal"></div>
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit Anggota' : 'Tambah Anggota Baru' }}</h3>
            <button class="close-btn" @click="closeMemberModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitMemberForm">
              <div class="form-group">
                <label for="name">Nama Lengkap</label>
                <input type="text" id="name" v-model="memberForm.name" required placeholder="Masukkan nama lengkap" />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="memberForm.email" required placeholder="Masukkan alamat email"
                  :disabled="isEditMode" />
                <div class="form-hint" v-if="isEditMode">
                  Email tidak dapat diubah
                </div>
              </div>

              <div class="form-group" v-if="!isEditMode">
                <label for="initialBalance">Saldo Awal (Rp)</label>
                <input type="text" id="initialBalance" v-model="memberForm.initialBalance" placeholder="0"
                  @input="formatInitialBalance" />
              </div>

              <div class="form-group">
                <label for="active">Status</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="active" v-model="memberForm.active" />
                  <label for="active">
                    <span class="toggle-switch-label">{{ memberForm.active ? 'Aktif' : 'Tidak Aktif' }}</span>
                  </label>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="closeMemberModal">Batal</button>
                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="loading-spinner small"></span>
                  {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Anggota' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Confirmation modal for activation/deactivation -->
      <div class="modal" v-if="showConfirmModal">
        <div class="modal-overlay" @click="closeConfirmModal"></div>
        <div class="modal-container small">
          <div class="modal-header">
            <h3>{{ confirmAction === 'activate' ? 'Aktifkan Anggota' : 'Nonaktifkan Anggota' }}</h3>
            <button class="close-btn" @click="closeConfirmModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <p v-if="confirmAction === 'activate'">
              Apakah Anda yakin ingin mengaktifkan kembali anggota <strong>{{ selectedMember?.name }}</strong>?
            </p>
            <p v-else>
              Apakah Anda yakin ingin menonaktifkan anggota <strong>{{ selectedMember?.name }}</strong>?
              <br><br>
              <span class="warning-text">Anggota yang tidak aktif tidak dapat melakukan transaksi.</span>
            </p>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeConfirmModal">Batal</button>
            <button class="confirm-btn" :class="confirmAction === 'activate' ? 'activate' : 'deactivate'"
              @click="confirmStatusChange" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner small"></span>
              {{ confirmAction === 'activate' ? 'Aktifkan' : 'Nonaktifkan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '../../layouts/AdminLayout.vue';
import { useAuthStore } from '../../stores/auth';
import { db } from '../../firebase/config';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

const router = useRouter();
const authStore = useAuthStore();

// State
const loading = ref(true);
const members = ref([]);
const searchQuery = ref('');
const showDetailsModal = ref(false);
const showMemberModal = ref(false);
const showConfirmModal = ref(false);
const selectedMember = ref(null);
const memberTransactions = ref([]);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const confirmAction = ref(''); // 'activate' or 'deactivate'

// Form state
const memberForm = ref({
  name: '',
  email: '',
  initialBalance: '',
  active: true
});

// Computed
const filteredMembers = computed(() => {
  if (!searchQuery.value.trim()) {
    return members.value;
  }

  const query = searchQuery.value.toLowerCase();
  return members.value.filter(member =>
    member.name.toLowerCase().includes(query) ||
    member.email.toLowerCase().includes(query)
  );
});

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const loadMembers = async () => {
  loading.value = true;

  try {
    // Get all members
    const membersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'member'),
    );

    const membersSnapshot = await getDocs(membersQuery);

    // Get balance for each member
    const membersData = [];

    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data();

      // Get balance
      const balanceDoc = await getDoc(doc(db, 'balances', memberDoc.id));
      const balance = balanceDoc.exists() ? balanceDoc.data().currentBalance || 0 : 0;

      // Get transaction count
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', memberDoc.id)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);

      membersData.push({
        id: memberDoc.id,
        name: memberData.name || '',
        email: memberData.email || '',
        photoURL: memberData.photoURL || null,
        createdAt: memberData.createdAt || null,
        active: memberData.active !== false, // Default to true if not set
        balance,
        totalTransactions: transactionsSnapshot.size
      });
    }

    members.value = membersData;
  } catch (error) {
    console.error('Error loading members:', error);
    window.showNotification('Gagal memuat data anggota', 'error');
  } finally {
    loading.value = false;
  }
};

const loadMemberTransactions = async (memberId) => {
  try {
    // Get recent transactions for the member
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', memberId),
      limit(5)
    );

    const transactionsSnapshot = await getDocs(transactionsQuery);

    const transactions = [];
    transactionsSnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    memberTransactions.value = transactions;
  } catch (error) {
    console.error('Error loading member transactions:', error);
    window.showNotification('Gagal memuat transaksi anggota', 'error');
  }
};

const viewMemberDetails = async (member) => {
  selectedMember.value = member;
  await loadMemberTransactions(member.id);
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedMember.value = null;
  memberTransactions.value = [];
};

const viewAllTransactions = () => {
  // Redirect to a transactions page filtered by this member
  // For now, we'll just close the modal
  closeDetailsModal();
};

const showAddMemberModal = () => {
  isEditMode.value = false;
  memberForm.value = {
    name: '',
    email: '',
    initialBalance: '',
    active: true
  };
  showMemberModal.value = true;
};

const editMember = (member) => {
  isEditMode.value = true;
  memberForm.value = {
    id: member.id,
    name: member.name,
    email: member.email,
    active: member.active
  };
  showMemberModal.value = true;
};

const closeMemberModal = () => {
  if (isSubmitting.value) return;

  showMemberModal.value = false;
  isEditMode.value = false;
  memberForm.value = {
    name: '',
    email: '',
    initialBalance: '',
    active: true
  };
};

const formatInitialBalance = () => {
  // Format the initial balance with thousand separators
  if (!memberForm.value.initialBalance) return;

  // Remove non-numeric characters
  let value = memberForm.value.initialBalance.replace(/\D/g, '');

  // Format with thousand separator
  if (value) {
    value = parseInt(value).toLocaleString('id-ID');
  }

  memberForm.value.initialBalance = value;
};

const submitMemberForm = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    if (isEditMode.value) {
      // Update existing member
      await updateDoc(doc(db, 'users', memberForm.value.id), {
        name: memberForm.value.name,
        active: memberForm.value.active,
        updatedAt: serverTimestamp()
      });

      // Update local state
      const index = members.value.findIndex(m => m.id === memberForm.value.id);
      if (index !== -1) {
        members.value[index] = {
          ...members.value[index],
          name: memberForm.value.name,
          active: memberForm.value.active
        };
      }

      window.showNotification('Data anggota berhasil diperbarui', 'success');
    } else {
      // Create new member
      const memberId = `member-${Date.now()}`;

      // Convert initial balance to number
      let initialBalance = 0;
      if (memberForm.value.initialBalance) {
        initialBalance = parseInt(memberForm.value.initialBalance.replace(/\D/g, ''));
      }

      // Add user document
      await setDoc(doc(db, 'users', memberId), {
        name: memberForm.value.name,
        email: memberForm.value.email,
        role: 'member',
        active: memberForm.value.active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add balance document
      await setDoc(doc(db, 'balances', memberId), {
        currentBalance: initialBalance,
        lastUpdated: serverTimestamp()
      });

      // Add to local state
      members.value.push({
        id: memberId,
        name: memberForm.value.name,
        email: memberForm.value.email,
        photoURL: null,
        createdAt: new Date(),
        active: memberForm.value.active,
        balance: initialBalance,
        totalTransactions: 0
      });

      window.showNotification('Anggota baru berhasil ditambahkan', 'success');
    }

    closeMemberModal();
  } catch (error) {
    console.error('Error submitting member form:', error);
    window.showNotification('Gagal menyimpan data anggota: ' + error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const deactivateMember = (member) => {
  selectedMember.value = member;
  confirmAction.value = 'deactivate';
  showConfirmModal.value = true;
};

const activateMember = (member) => {
  selectedMember.value = member;
  confirmAction.value = 'activate';
  showConfirmModal.value = true;
};

const closeConfirmModal = () => {
  if (isSubmitting.value) return;

  showConfirmModal.value = false;
  selectedMember.value = null;
  confirmAction.value = '';
};

const confirmStatusChange = async () => {
  if (isSubmitting.value || !selectedMember.value) return;

  isSubmitting.value = true;

  try {
    const newStatus = confirmAction.value === 'activate';

    // Update in Firestore
    await updateDoc(doc(db, 'users', selectedMember.value.id), {
      active: newStatus,
      updatedAt: serverTimestamp()
    });

    // Update local state
    const index = members.value.findIndex(m => m.id === selectedMember.value.id);
    if (index !== -1) {
      members.value[index] = {
        ...members.value[index],
        active: newStatus
      };
    }

    const message = newStatus
      ? `Anggota ${selectedMember.value.name} berhasil diaktifkan`
      : `Anggota ${selectedMember.value.name} berhasil dinonaktifkan`;

    window.showNotification(message, 'success');
    closeConfirmModal();
  } catch (error) {
    console.error('Error changing member status:', error);
    window.showNotification('Gagal mengubah status anggota: ' + error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await loadMembers();
});
</script>

<style scoped>
.members-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header actions */
.page-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #4338ca;
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

/* Table styles */
.table-responsive {
  overflow-x: auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table th,
.members-table td {
  padding: 16px;
  text-align: left;
}

.members-table th {
  font-weight: 500;
  color: #4b5563;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.members-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.members-table tbody tr:last-child {
  border-bottom: none;
}

.members-table tbody tr:hover {
  background-color: #f9fafb;
}

/* Mobile view card styles */
.mobile-view {
  display: none;
}

.member-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
}

.member-card-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f3f4f6;
}

.member-email {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 4px;
}

.member-card-body {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.member-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.member-detail:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  text-align: right;
}

.member-card-footer {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
}

.member-card-footer .action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-avatar.large {
  width: 64px;
  height: 64px;
  font-size: 1.2rem;
}

.member-name {
  font-weight: 500;
}

.member-id {
  font-size: 0.8rem;
  color: #6b7280;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactive {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.action-btn.view:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.action-btn.edit:hover {
  color: #f59e0b;
  border-color: #f59e0b;
}

.action-btn.deactivate:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.action-btn.activate:hover {
  color: #10b981;
  border-color: #10b981;
}

/* Modal styles */
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 51;
  margin: 0 16px;
}

.modal-container.small {
  max-width: 400px;
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

.modal-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* Member details styles */
.member-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.member-header-info {
  flex: 1;
}

.member-header-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.member-header-info p {
  color: #6b7280;
  margin-bottom: 8px;
}

.member-joined {
  font-size: 0.9rem;
  color: #6b7280;
}

.member-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-title {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.empty-transactions {
  padding: 24px 0;
  text-align: center;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 8px;
}

.transactions-list {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.transaction-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

.transaction-details {
  flex: 1;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.transaction-type {
  font-weight: 500;
}

.transaction-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.transaction-amount {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.transaction-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
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

.view-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background-color: #f9fafb;
  color: var(--primary-color);
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-all-btn:hover {
  background-color: #f3f4f6;
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="email"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.form-group input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.form-hint {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #6b7280;
}

.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.toggle-switch input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-switch label::before {
  content: '';
  width: 48px;
  height: 24px;
  background-color: #e5e7eb;
  border-radius: 12px;
  margin-right: 12px;
  transition: all 0.2s;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-switch label::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  left: 3px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked+label::before {
  background-color: #10b981;
}

.toggle-switch input:checked+label::after {
  left: 27px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn,
.confirm-btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn {
  background-color: white;
  color: var(--text-color);
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background-color: #f3f4f6;
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background-color: #4338ca;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirm-btn.activate {
  background-color: #10b981;
  color: white;
  border: none;
}

.confirm-btn.activate:hover:not(:disabled) {
  background-color: #059669;
}

.confirm-btn.deactivate {
  background-color: #ef4444;
  color: white;
  border: none;
}

.confirm-btn.deactivate:hover:not(:disabled) {
  background-color: #dc2626;
}

.confirm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.warning-text {
  color: #ef4444;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .member-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .member-header-info {
    text-align: center;
  }

  .member-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .transaction-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .page-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }

  .member-card-footer {
    flex-wrap: wrap;
  }

  .btn-text {
    display: none;
  }

  .add-btn {
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .member-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 16px;
  }

  .detail-value {
    text-align: left;
  }

  .member-card-header {
    flex-direction: column;
    gap: 12px;
  }

  .member-card-header .status-badge {
    align-self: flex-start;
  }

  .modal-header h3 {
    font-size: 1rem;
  }
}
</style>