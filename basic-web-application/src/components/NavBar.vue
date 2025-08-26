<template>
  <nav class="navbar navbar-expand-lg fixed-top bg-light shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-primary" href="/">Inter Throw Organization</a>

      <button
        class="navbar-toggler"
        type="button"
        @click="isNavbarOpen = !isNavbarOpen"
        :aria-expanded="isNavbarOpen"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-end" :class="{ show: isNavbarOpen }">
        <ul class="navbar-nav">
          <li v-for="item in navItems" :key="item.path" class="nav-item">
            <router-link
              :to="item.path"
              class="nav-link px-3 py-2 rounded-2 text-secondary fw-medium transition-all"
              active-class="bg-primary text-white"
              @click="isNavbarOpen = false"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>

        <form class="d-flex ms-3" role="search" @submit.prevent="handleSearch">
          <input
            v-model="searchQuery"
            class="form-control me-2 border-2 border-light-subtle rounded-3"
            type="search"
            placeholder="Search"
            aria-label="Search"
          />
          <button class="btn btn-outline-success rounded-3 px-3" type="submit">
            Search
          </button>
        </form>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isNavbarOpen = ref(false)
const searchQuery = ref('')

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Resource', path: '/resource' },
  { name: 'Membership', path: '/member' },
  { name: 'Contact', path: '/contact' },
  { name: 'Log In', path: '/login' }
]

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Search:', searchQuery.value)
  }
}
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}

.nav-link:hover:not(.bg-primary) {
  background-color: var(--bs-light) !important;
  color: var(--bs-dark) !important;
}
</style>
