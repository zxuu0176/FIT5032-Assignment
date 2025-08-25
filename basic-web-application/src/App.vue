<template>
  <div>
    <nav class="navbar">
      <div class="brand">Brand</div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <router-link to="/login" class="nav-link">Log In</router-link>
      </div>
    </nav>
  </div>
  <router-view />

</template>

<script setup>

</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.nav-link:hover {
  background-color: #e9ecef;
  color: #212529;
  transform: translateY(-1px);
}

.nav-link.active {
  background-color: #007bff;
  color: white;
}

body {
  padding-top: 70px;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-link {
    width: 100%;
    text-align: center;
  }
}
</style>
