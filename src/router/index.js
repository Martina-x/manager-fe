import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./../components/Home.vue";

const routes = [
  {
    name: 'Home',
    meta: {
      title: '首页'
    },
    path: '/',
    redirect: '/login',
    component: Home,
    children: [
      {
        name: 'Welcome',
        meta: {
          title: '欢迎页'
        },
        path: '/welcome',
        component: () => import('../views/Welcome.vue'),
      }
    ]
  },
  {
    name: 'Login',
    meta: {
      title: '登录'
    },
    path: '/login',
    component: () => import('../views/Login.vue')
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router;