<template>
  <AdminLayout title="Laporan Keuangan">
    <div class="reports-page">
      <div class="reports-card">
        <h2>Laporan Keuangan</h2>
        <p>Halaman ini masih dalam pengembangan.</p>
        <p>Fitur cetak laporan ke PDF akan segera tersedia.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '../../layouts/AdminLayout.vue';
</script>

<style scoped>
.reports-page {
  max-width: 900px;
  margin: 0 auto;
}

.reports-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>