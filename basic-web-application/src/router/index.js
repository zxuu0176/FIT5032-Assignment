import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/about',
    name: 'AboutPage',
    component: () => import('../views/AboutPage.vue')
  },
  {
    path: '/login',
    name: 'LogInPage',
    component: () => import('../views/LogInPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
