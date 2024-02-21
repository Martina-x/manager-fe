import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./../components/Home.vue";
import Welcome from "./../components/Welcome.vue";
import Login from "./../components/Login.vue";

const routes = [
  {
    name: 'Home',
    meta: {
      title: '首页'
    },
    path: '/',
    redirect: '/welcome',
    component: Home,
    children: [
      {
        name: 'Welcome',
        meta: {
          title: '欢迎页'
        },
        path: '/welcome',
        component: Welcome,
      },
      {
        name: 'Login',
        meta: {
          title: '登录页'
        },
        path: '/login',
        component: Login,
      }
    ]
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router;