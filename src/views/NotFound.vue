<template>
  <div class="not-found">
    <div class="container">
      <div class="error-content">
        <div class="error-code">404</div>
        <h1 class="error-title">Halaman Tidak Ditemukan</h1>
        <p class="error-message">Maaf, halaman yang Anda cari tidak ditemukan.</p>
        <div class="error-actions">
          <router-link to="/" class="btn-primary">Kembali ke Beranda</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component for 404 page
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f9fafb;
}

.error-content {
  text-align: center;
  padding: 30px;
  max-width: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 20px;
}

.error-title {
  font-size: 1.8rem;
  margin-bottom: 16px;
  color: var(--text-color);
}

.error-message {
  font-size: 1.1rem;
  margin-bottom: 30px;
  color: #6b7280;
}

.error-actions {
  margin-top: 20px;
}

.btn-primary {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>