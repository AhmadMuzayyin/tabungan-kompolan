<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-logo">
        <img src="/logo.svg" alt="Logo" width="80" height="80" />
        <h1>Keuangan Organisasi</h1>
      </div>

      <div class="login-form">
        <!-- Admin login (for initial admin setup) -->
        <form @submit.prevent="loginWithEmail">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="admin@example.com" />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required placeholder="••••••••" />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
            {{ authStore.loading ? 'Sedang Masuk...' : 'Masuk' }}
          </button>
        </form>
        <div class="divider">atau</div>
        <!-- Google login -->
        <button @click="loginWithGoogle" class="btn btn-google" :disabled="authStore.loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z">
            </path>
            <path fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z">
            </path>
            <path fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z">
            </path>
            <path fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z">
            </path>
          </svg>
          Masuk dengan Google
        </button>

        <div class="error-message" v-if="authStore.error">
          {{ authStore.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Form state
const email = ref('');
const password = ref('');

// Methods
const loginWithGoogle = async () => {
  try {
    await authStore.loginWithGoogle();
    await authStore.fetchUserProfile();
    // Redirect based on role
    if (authStore.profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/member');
    }

    // Show success notification
    window.showNotification('Login berhasil!', 'success');
  } catch (error) {
    console.error('Google login error:', error);
    window.showNotification('Login gagal: ' + error.message, 'error');
  }
};

const loginWithEmail = async () => {
  try {
    await authStore.loginWithEmail(email.value, password.value);

    // Redirect based on role
    if (authStore.isAdmin) {
      router.push('/admin');
    } else {
      router.push('/member');
    }

    window.showNotification('Login berhasil!', 'success');
  } catch (error) {
    console.error('Email login error:', error);
    window.showNotification('Login gagal: ' + error.message, 'error');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f3f4f6;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo h1 {
  font-size: 1.5rem;
  margin-top: 12px;
  color: var(--primary-color);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn-google {
  background-color: white;
  color: #333;
  border: 1px solid #d1d5db;
}

.btn-google:hover:not(:disabled) {
  background-color: #f9fafb;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.divider::before {
  margin-right: 10px;
}

.divider::after {
  margin-left: 10px;
}

.error-message {
  color: var(--error-color);
  font-size: 0.9rem;
  padding: 8px 12px;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
}
</style>