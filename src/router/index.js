import { createRouter, createWebHashHistory } from "vue-router";

import storage from "@/utils/storage.js";
import api from "@/api";
import utils from '@/utils/utils';

const routes = [
  {
    name: 'Home',
    meta: {
      title: '首页'
    },
    path: '/',
    redirect: '/welcome',
    // component: Home,
    component: () => import('@/components/Home.vue'),
    children: [
      {
        name: 'Welcome',
        meta: {
          title: '欢迎页'
        },
        path: '/welcome',
        component: () => import('@/views/Welcome.vue'),
      },
      // {
      //   name: 'User',
      //   meta: {
      //     title: '用户管理'
      //   },
      //   path: '/system/user',
      //   component: () => import('@/views/User.vue'),
      // },
      // {
      //   name: 'Menu',
      //   meta: {
      //     title: '菜单管理'
      //   },
      //   path: '/system/menu',
      //   component: () => import('@/views/Menu.vue'),
      // },
      // {
      //   name: 'Role',
      //   meta: {
      //     title: '角色管理'
      //   },
      //   path: '/system/role',
      //   component: () => import('@/views/Role.vue'),
      // },
      // {
      //   name: 'Dept',
      //   meta: {
      //     title: '部门管理'
      //   },
      //   path: '/system/dept',
      //   component: () => import('@/views/Dept.vue'),
      // }

    ]
  },
  {
    name: 'Login',
    meta: {
      title: '登录'
    },
    path: '/login',
    component: () => import('../views/Login.vue')
  },
  {
    name: '404',
    meta: {
      title: '页面未找到'
    },
    path: '/404',
    component: () => import('../views/404.vue')
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

async function loadAsyncRoutes() {
  // 判断用户是否已登录
  let userInfo = storage.getItem('userInfo') || {};
  if (userInfo.token) {
    try {
      const { menuList } = await api.getPermissionList();
      let routes = utils.generateRoute(menuList);
      const modules = import.meta.glob('../views/*.vue');
      routes.forEach((route) => {
        route.component = modules[`../views/${route.component}.vue`];
        router.addRoute("Home", route);
      })
      
    } catch (error) {
      console.log(error);
    }
  }
}

await loadAsyncRoutes();

// 判断当前地址是否可以访问
function checkPermission(path) {
  let hasPermission = router.getRoutes().filter(route => route.path == path).length;
  if (hasPermission) {
    return true;
  } else {
    return false;
  }
}

// 导航守卫
router.beforeEach(async (to, from, next) => {
  await loadAsyncRoutes();
  if (router.hasRoute(to.name)) {
    document.title = to.meta.title;
    next();
  }else {
    next('/404');
  }
})
export default router;