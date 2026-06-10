import Vue from 'vue'
import VueRouter from 'vue-router'

// 解决重复跳转 NavigationDuplicated 报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    // 只屏蔽重复导航错误，其他异常正常抛出
    if (err.name !== 'NavigationDuplicated') throw err
  })
}
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') throw err
  })
}

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