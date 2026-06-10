import Vue from 'vue'
import VueRouter from 'vue-router'

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
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
