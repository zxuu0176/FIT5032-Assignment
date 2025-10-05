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

        <div class="d-flex align-items-center ms-3">
          <template v-if="userEmail">
            <div class="me-3 text-secondary">{{ userEmail }}</div>
            <button class="btn btn-outline-secondary btn-sm" @click="logout">Logout</button>
          </template>
          <template v-else>
            <router-link class="btn btn-primary me-2 btn-sm" to="/login">Log In</router-link>
            <router-link class="btn btn-outline-primary btn-sm" to="/signup">Sign Up</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

const isNavbarOpen = ref(false)

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Resource', path: '/resource' },
  { name: 'Membership', path: '/member' },
  { name: 'Contact', path: '/contact' },
  { name: 'Admin', path: '/admin' }
]

const router = useRouter()

const userEmail = ref(null)
let unsubscribe = null

onMounted(() => {
  const auth = getAuth()
  unsubscribe = onAuthStateChanged(auth, (user) => {
    userEmail.value = user ? user.email : null
  })
})

onUnmounted(() => {
  if (typeof unsubscribe === 'function') unsubscribe()
})

const logout = async () => {
  try {
    await signOut(getAuth())
    userEmail.value = null
    router.push('/')
  } catch (err) {
    console.error('Logout failed', err)
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
