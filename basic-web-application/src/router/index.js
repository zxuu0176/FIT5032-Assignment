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
  },
  {
    path: '/resource',
    name: 'ResourcePage',
    component: () => import('../views/ResourcePage.vue')
  },
  {
    path: '/member',
    name: 'MemberPage',
    component: () => import('../views/MemberPage.vue')
  },
  {
    path: '/contact',
    name: 'ContactPage',
    component: () => import('../views/ContactPage.vue')
  },
  {
    path: '/signup',
    name: 'SignUpPage',
    component: () => import('../views/SignUpPage.vue')
  },
  {
    path: '/admin',
    name: 'AdminPage',
    component: () => import('../views/AdminPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
