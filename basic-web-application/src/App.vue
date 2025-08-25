<script setup>

</script>

<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/login">Log In</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style scoped>
nav {
  background: #f8f9fa;
  padding: 1rem;
}

nav a {
  margin-right: 1rem;
  color: #007bff;
  text-decoration: none;
}

nav a.router-link-active {
  font-weight: bold;
  color: #0056b3;
}
</style>
