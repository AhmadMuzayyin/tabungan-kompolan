<template>
  <div class="member-layout">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <img src="/logo.svg" alt="Logo" width="36" height="36" />
            <h1>TASOMI</h1>
          </div>

          <div class="profile" @click="toggleProfileMenu" ref="profileRef">
            <div class="profile-info">
              <span class="profile-name">{{ authStore.profile?.name }}</span>
              <span class="profile-role">Anggota</span>
            </div>

            <div class="profile-avatar">
              <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" alt="Avatar" />
              <div v-else class="profile-avatar-placeholder">
                {{ getInitials(authStore.profile?.name) }}
              </div>
            </div>

            <!-- Profile dropdown menu -->
            <div v-if="showProfileMenu" class="profile-menu">
              <router-link to="/member/profile" class="profile-menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profil
              </router-link>

              <div class="profile-menu-divider"></div>

              <button @click="logout" class="profile-menu-item logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="main">
      <div class="container">
        <slot></slot>
      </div>
    </main>

    <!-- Navigation -->
    <nav class="bottom-nav">
      <router-link to="/member" class="nav-item" :class="{ active: isActive('/member') }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Beranda</span>
      </router-link>

      <router-link to="/member/deposit" class="nav-item" :class="{ active: isActive('/member/deposit') }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Tabung</span>
      </router-link>

      <router-link to="/member/withdraw" class="nav-item" :class="{ active: isActive('/member/withdraw') }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Tarik</span>
      </router-link>

      <router-link to="/member/history" class="nav-item" :class="{ active: isActive('/member/history') }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>Riwayat</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTransactionStore } from '../stores/transaction';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

// Profile menu state
const showProfileMenu = ref(false);
const profileRef = ref(null);

// Methods
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

const closeProfileMenu = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    // Unsubscribe from all transaction listeners
    transactionStore.unsubscribeAll();
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

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', closeProfileMenu);

  // Subscribe to user's transactions for realtime updates
  if (authStore.user) {
    transactionStore.subscribeToUserTransactions(authStore.user.uid);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeProfileMenu);
});
</script>

<style scoped>
.member-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Header */
.header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo h1 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Profile */
.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.profile-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.profile-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.profile-role {
  font-size: 0.8rem;
  color: #6b7280;
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

.profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 200px;
  z-index: 20;
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

/* Main content */
.main {
  flex: 1;
  padding: 20px 0;
  background-color: var(--bg-color);
}

/* Navigation */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  color: #6b7280;
  text-decoration: none;
  width: 25%;
  transition: color 0.2s;
}

.nav-item span {
  font-size: 0.8rem;
  margin-top: 4px;
}

.nav-item.active {
  color: var(--primary-color);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-info {
    display: none;
  }
}
</style>