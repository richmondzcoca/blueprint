import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Home from '../views/Home'
import Login from '../views/Login'
import middleware from './middleware'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: middleware.user
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: middleware.guest,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    beforeEnter: middleware.user
  }
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

export default router
