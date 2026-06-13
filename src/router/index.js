import Vue from 'vue'
import VueRouter from 'vue-router'
import { clearAdminSession, isValidAdminToken } from '@/utils/auth'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/list/:type',
    name: 'List',
    component: () => import('../views/List.vue')
  },
  {
    path: '/more/:type',
    name: 'MoreRelics',
    component: () => import('../views/MoreRelics.vue')
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('../views/Detail.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/FooterInfo.vue'),
    meta: { pageKey: 'about' }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/FooterInfo.vue'),
    meta: { pageKey: 'feedback' }
  },
  {
    path: '/statement',
    name: 'Statement',
    component: () => import('../views/FooterInfo.vue'),
    meta: { pageKey: 'statement' }
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('../views/FooterInfo.vue'),
    meta: { pageKey: 'team' }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    meta: { requiresAuth: true },
    component: () => import('../views/AdminDashboard.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/admin/login' && isValidAdminToken()) {
    next({ path: '/admin' })
    return
  }

  if (!to.matched.some(record => record.meta.requiresAuth)) {
    next()
    return
  }

  if (isValidAdminToken()) {
    next()
    return
  }

  clearAdminSession()
  next({ path: '/admin/login', query: { redirect: to.fullPath } })
})

export default router
