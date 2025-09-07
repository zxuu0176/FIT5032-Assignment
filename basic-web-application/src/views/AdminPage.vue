<template>
  <div v-if="role === 'admin'" class="admin-page">
    <h1>Welcome to the Admin Page</h1>
    <p>Welcome, {{ role }}.</p>
  </div>
  <div v-else class="admin-page">
    <p v-if="role === 'user'">You are not an admin, you are a {{ role }}.</p>
    <p v-else>You need to log in first.</p>
  </div>
</template>

<script setup>
import { useAuth } from '../functions/role';

const role = useAuth().role;
</script>

<style scoped>

</style>
