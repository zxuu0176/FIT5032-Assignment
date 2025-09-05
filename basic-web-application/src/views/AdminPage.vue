<template>
  <div class="home-page">
    <h1>Welcome to the Admin Page</h1>
    <p v-if="role === 'admin'">Welcome, {{ role }}.</p>
    <p v-else>You are not an admin, you are a {{ role }}.</p>
  </div>
</template>

<script setup>
import { useAuth } from '../functions/role';

const role = useAuth().role;
</script>

<style scoped>

</style>
