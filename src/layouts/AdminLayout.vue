<template>
  <div class="admin-layout" :class="layoutClasses">
    <!-- Toggle button untuk mobile -->
    <button v-if="isMobile" class="mobile-menu-toggle" @click="toggleSidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    <div v-if="isMobile && !sidebarCollapsed" class="sidebar-overlay" @click="toggleSidebar"></div>
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'mobile-sidebar': isMobile }">
      <div class="sidebar-header">
        <img src="/logo.svg" alt="Logo" width="36" height="36" />
        <h1 v-if="!sidebarCollapsed">Keuangan Organisasi</h1>
        <button class="toggle-btn" @click="toggleSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="sidebarCollapsed" d="M13 17l5-5-5-5M6 17l5-5-5-5"></path>
            <path v-else d="M11 17l-5-5 5-5M18 17l-5-5 5-5"></path>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" :class="{ active: isActive('/admin') }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          <span v-if="!sidebarCollapsed">Dashboard</span>
        </router-link>

        <router-link to="/admin/approvals" class="nav-item" :class="{ active: isActive('/admin/approvals') }">
          <div class="nav-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span class="notification-badge" v-if="pendingCount > 0">{{ pendingCount > 9 ? '9+' : pendingCount
              }}</span>
          </div>
          <span v-if="!sidebarCollapsed">Approvals</span>
        </router-link>

        <router-link to="/admin/members" class="nav-item" :class="{ active: isActive('/admin/members') }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span v-if="!sidebarCollapsed">Anggota</span>
        </router-link>

        <router-link to="/admin/reports" class="nav-item" :class="{ active: isActive('/admin/reports') }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span v-if="!sidebarCollapsed">Laporan</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="profile" @click="toggleProfileMenu" ref="profileRef">
          <div class="profile-avatar">
            <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" alt="Avatar" />
            <div v-else class="profile-avatar-placeholder">
              {{ getInitials(authStore.profile?.name) }}
            </div>
          </div>

          <div class="profile-info" v-if="!sidebarCollapsed">
            <span class="profile-name">{{ authStore.profile?.name }}</span>
            <span class="profile-role">Admin</span>
          </div>

          <!-- Profile dropdown menu -->
          <div v-if="showProfileMenu" class="profile-menu" :class="{ 'collapsed': sidebarCollapsed }">
            <router-link to="/admin/profile" class="profile-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profil</span>
            </router-link>

            <router-link to="/admin/settings" class="profile-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                </path>
              </svg>
              <span>Pengaturan</span>
            </router-link>

            <div class="profile-menu-divider"></div>

            <button @click="logout" class="profile-menu-item logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content" :class="{ 'mobile-content': isMobile }">
      <header class="main-header">
        <div class="header-title">
          <h2>{{ pageTitle }}</h2>
        </div>

        <div class="header-actions">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Cari..." v-model="searchQuery" @input="$emit('search', searchQuery)" />
          </div>

          <button class="notification-btn" @click="toggleNotifications" ref="notificationRef">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notification-badge" v-if="pendingCount > 0">{{ pendingCount > 9 ? '9+' : pendingCount
              }}</span>
          </button>

          <!-- Notifications dropdown -->
          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="notifications-header">
              <h3>Notifikasi</h3>
              <button class="mark-all-read" @click="markAllRead">Tandai Semua Dibaca</button>
            </div>

            <div v-if="pendingCount === 0" class="notifications-empty">
              <p>Tidak ada notifikasi</p>
            </div>

            <div v-else class="notifications-list">
              <router-link to="/admin/approvals" class="notification-item" @click="showNotifications = false">
                <div class="notification-icon pending">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div class="notification-content">
                  <p>
                    <strong>{{ pendingCount }}</strong> transaksi menunggu persetujuan
                  </p>
                  <span class="notification-time">Klik untuk melihat</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </header>

      <div class="content">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTransactionStore } from '../stores/transaction';

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
});

const emit = defineEmits(['search']);

const route = useRoute();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

// State
const isMobile = ref(false);
const sidebarCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true');
const showProfileMenu = ref(false);
const showNotifications = ref(false);
const searchQuery = ref('');
const profileRef = ref(null);
const notificationRef = ref(null);

// Computed
const pageTitle = computed(() => props.title || 'Dashboard');

const pendingCount = computed(() => {
  return transactionStore.pendingTransactions.length;
});

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value);
};

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
  if (showProfileMenu.value) {
    showNotifications.value = false;
  }
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    showProfileMenu.value = false;
  }
};

const closeProfileMenu = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
};

const closeNotifications = (event) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target)) {
    showNotifications.value = false;
  }
};

const logout = async () => {
  try {
    // Unsubscribe from all transaction listeners
    transactionStore.unsubscribeAll();
    await authStore.logout();
    window.showNotification('Anda telah keluar', 'info');
  } catch (error) {
    console.error('Logout error:', error);
    window.showNotification('Gagal keluar: ' + error.message, 'error');
  }
};

const isActive = (path) => {
  return route.path === path;
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

const markAllRead = () => {
  // This function would typically update a read status in the database
  // For now, we just close the notifications dropdown
  showNotifications.value = false;
  window.showNotification('Semua notifikasi ditandai telah dibaca', 'success');
};

// Watchers
watch(route, () => {
  // Close menus when route changes
  showProfileMenu.value = false;
  showNotifications.value = false;
});

// Lifecycle hooks
onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  document.addEventListener('click', closeProfileMenu);
  document.addEventListener('click', closeNotifications);

  // Subscribe to pending transactions
  if (authStore.isAdmin) {
    transactionStore.subscribeToPendingTransactions();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize);
  document.removeEventListener('click', closeProfileMenu);
  document.removeEventListener('click', closeNotifications);
});
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
  // Auto-collapse sidebar on mobile
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
};
const layoutClasses = computed(() => ({
  'is-mobile': isMobile.value
}));
</script>

<style scoped>
.mobile-menu-toggle {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 30;
  background-color: white;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  cursor: pointer;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 15;
}

.mobile-sidebar {
  z-index: 20;
  width: 280px;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.mobile-sidebar.sidebar-collapsed {
  transform: translateX(-100%);
}

.mobile-content {
  margin-left: 0 !important;
  padding-top: 60px;
  /* Space for mobile header */
}

.is-mobile .main-header {
  position: fixed;
  width: 100%;
  padding-left: 60px;
  /* Space for menu button */
}

@media (max-width: 768px) {
  .search-box {
    display: none;
  }

  .header-actions {
    justify-content: flex-end;
  }

  /* Mobile chart adjustments */
  .charts-container {
    grid-template-columns: 1fr !important;
  }

  /* Mobile stats */
  .stats-container {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .chart-content {
    height: 250px;
  }

  .main-content {
    padding: 16px 12px;
  }
}

.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar styles */
.sidebar {
  width: 260px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow-x: hidden;
  position: fixed;
  height: 100vh;
  z-index: 20;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  height: 70px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h1 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
  overflow: hidden;
}

.toggle-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background-color: #f3f4f6;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  margin: 4px 10px;
  border-radius: 8px;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: var(--primary-color);
}

.nav-item.active {
  background-color: rgba(79, 70, 229, 0.15);
  /* Warna latar lebih kuat */
  color: var(--primary-color);
  font-weight: 600;
  /* Lebih tebal */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* Tambahkan shadow */
}

/* Tambahkan indikator di sebelah kiri untuk menu aktif */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: var(--primary-color);
  border-radius: 0 4px 4px 0;
}

.nav-item-icon {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e5e7eb;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profile-name {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-role {
  font-size: 0.8rem;
  color: #6b7280;
}

.profile-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 200px;
  z-index: 30;
}

.profile-menu.collapsed {
  left: auto;
  right: 0;
}

.profile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
}

.profile-menu-item:hover {
  background-color: #f3f4f6;
}

.profile-menu-item.logout {
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-size: 1rem;
  color: var(--error-color);
}

.profile-menu-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}

/* Main content styles */
.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

.sidebar-collapsed+.main-content {
  margin-left: 80px;
}

.main-header {
  height: 70px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
  width: 240px;
  transition: width 0.3s;
}

.search-box:focus-within {
  background-color: white;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 300px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  padding: 4px 0;
  outline: none;
}

.notification-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  color: #4b5563;
}

.notification-btn:hover {
  background-color: #e5e7eb;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 30;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.notifications-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.mark-all-read {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.mark-all-read:hover {
  background-color: rgba(79, 70, 229, 0.1);
}

.notifications-empty {
  padding: 24px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  text-decoration: none;
  color: var(--text-color);
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.content {
  margin-top: 70px;
  padding: 24px;
  background-color: #f9fafb;
  min-height: calc(100vh - 70px);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }

  .sidebar-collapsed {
    width: 0;
    opacity: 0;
  }

  .main-content {
    margin-left: 80px;
  }

  .sidebar-collapsed+.main-content {
    margin-left: 0;
  }

  .search-box {
    width: 160px;
  }

  .search-box:focus-within {
    width: 200px;
  }
}

@media (max-width: 640px) {
  .search-box {
    display: none;
  }
}
</style>