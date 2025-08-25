<template>
  <div class="app-container">
    <NavBar />
    <main class="main-content">
      <div class="router-view-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
</script>

<style scoped>
html, body, #app {
  width: 100%;
  margin: 0;
  padding: 0;
}

.app-container {
  min-height: 100vh;
  display: flex;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  margin-top: 80px;
  width: 100%;
}

.router-view-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .main-content {
    margin-top: 130px;
    padding: 1rem;
  }
}
</style>
