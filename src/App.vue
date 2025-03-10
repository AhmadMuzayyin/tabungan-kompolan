<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global notification component -->
    <Notification v-if="notification.show" :type="notification.type" :message="notification.message"
      @close="closeNotification" />
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import { useAuthStore } from './stores/auth';
import { registerSW } from 'virtual:pwa-register';
import Notification from './components/common/Notification.vue';

// Notification state
const notification = reactive({
  show: false,
  type: 'info',
  message: '',
  timeout: null
});

const showNotification = (message, type = 'info', duration = 3000) => {
  // Clear any existing timeout
  if (notification.timeout) {
    clearTimeout(notification.timeout);
  }

  // Show new notification
  notification.show = true;
  notification.type = type;
  notification.message = message;

  // Auto close after duration
  notification.timeout = setTimeout(() => {
    closeNotification();
  }, duration);
};

const closeNotification = () => {
  notification.show = false;
  if (notification.timeout) {
    clearTimeout(notification.timeout);
    notification.timeout = null;
  }
};

// Make notification function global
window.showNotification = showNotification;

// Initialize auth store
const authStore = useAuthStore();

// Register service worker with auto update
const updateSW = registerSW({
  onNeedRefresh() {
    showNotification('New content available, click to update.', 'info', 0);
  },
  onOfflineReady() {
    showNotification('App ready to work offline', 'success');
  }
});

onMounted(async () => {
  // Initialize auth state
  await authStore.init();
});
</script>

<style>
/* Base styles */
:root {
  --primary-color: #4f46e5;
  --secondary-color: #818cf8;
  --accent-color: #6366f1;
  --text-color: #1f2937;
  --bg-color: #f9fafb;
  --error-color: #ef4444;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>