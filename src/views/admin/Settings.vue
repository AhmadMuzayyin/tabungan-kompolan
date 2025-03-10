<template>
  <AdminLayout title="Pengaturan">
    <div class="settings-page">
      <div class="settings-card">
        <h2>Pengaturan Aplikasi</h2>
        <p>Halaman ini masih dalam pengembangan.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '../../layouts/AdminLayout.vue';
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>