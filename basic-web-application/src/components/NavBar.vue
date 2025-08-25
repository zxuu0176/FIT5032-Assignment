<template>
  <nav class="navbar">
    <div class="brand">Brand</div>
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
      <router-link to="/login" class="nav-link">Log In</router-link>
    </div>
  </nav>
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
  background-color: #ffffff;
  border-bottom: 1px solid #e1e4e8;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #5a677d;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.nav-link:hover {
  background-color: #f0f3f9;
  color: #2c3e50;
}

.nav-link.router-link-active {
  background-color: #3498db;
  color: white;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.8rem;
    width: 100%;
  }

  .nav-link {
    width: 100%;
    text-align: center;
  }
}
</style>
