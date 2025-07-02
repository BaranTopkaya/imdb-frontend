import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import MovieDetail from '../views/MovieDetail.vue'
import MovieComments from '../views/MovieComments.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/movie/:id',
    name: 'movieDetail',
    component: MovieDetail,
    props: true,
  },
  {
  path: '/login',
  name: 'login',
  component: () => import('../views/Login.vue')
  },
  {
  path: '/register',
  name: 'register',
  component: () => import('../views/Register.vue')
  },
  {
    path: '/movie/:id/comments',
    name: 'movieComments',
    component: MovieComments,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
