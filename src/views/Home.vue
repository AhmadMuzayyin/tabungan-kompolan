<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>Tabungan Organisasi</h1>
          <p>Aplikasi pengelolaan keuangan untuk organisasi Anda</p>
          <div class="hero-actions">
            <router-link to="/login" class="btn-primary">Masuk</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="section-title">Fitur Utama</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3>Pengelolaan Tabungan</h3>
            <p>Kelola tabungan anggota dengan mudah dan transparan</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            </div>
            <h3>Analisis Keuangan</h3>
            <p>Dapatkan wawasan tentang keuangan organisasi melalui grafik dan laporan</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Manajemen Anggota</h3>
            <p>Kelola anggota dan hak akses dengan mudah</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3>Laporan Lengkap</h3>
            <p>Cetak laporan keuangan untuk keperluan dokumentasi</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Mulai Kelola Keuangan Organisasi</h2>
          <p>Daftar sekarang dan rasakan kemudahan mengelola keuangan organisasi</p>
          <router-link to="/login" class="btn-primary">Mulai Sekarang</router-link>
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} Tabungan Organisasi. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Component for landing page
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero-section {
  background-color: var(--primary-color);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-primary {
  display: inline-block;
  background-color: white;
  color: var(--primary-color);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.features-section {
  padding: 80px 0;
  background-color: #f9fafb;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 48px;
  color: var(--text-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  background-color: rgba(79, 70, 229, 0.1);
  color: var(--primary-color);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: var(--text-color);
}

.feature-card p {
  color: #6b7280;
  font-size: 0.95rem;
}

.cta-section {
  background-color: var(--primary-color);
  color: white;
  padding: 60px 0;
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2rem;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.1rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.footer {
  background-color: #1f2937;
  color: white;
  padding: 20px 0;
  text-align: center;
  margin-top: auto;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .features-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 1.5rem;
    margin-bottom: 32px;
  }
}
</style>