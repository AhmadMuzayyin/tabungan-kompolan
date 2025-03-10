<template>
  <MemberLayout>
    <div class="profile-page">
      <div class="profile-card">
        <h2>Profil Anggota</h2>
        <p>Halaman ini masih dalam pengembangan.</p>
      </div>
    </div>
  </MemberLayout>
</template>

<script setup>
import MemberLayout from '../../layouts/MemberLayout.vue';
</script>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 0 auto;
}

.profile-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>