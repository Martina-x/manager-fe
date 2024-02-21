### 项目初始化

```json
{
  "scripts": {
    "dev": "vite --mode dev",
  },
}

```

```js
// .env.dev
NODE_ENV=development
VITE_name=SATAA
```

![](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240221223215888.png)

![image-20240221223238778](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240221223238778.png)

之所以``MODE`的值为`dev`是因为package.json`的配置优先级高于项目的优先级。

另外，当`.env.dev`文件中设置的`MODE_ENV`的值为除了`development`的其他值外，会有报错提示

![image-20240221223943252](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240221223943252.png)



### 路由封装

#### 路由配置和全局导入

```js
// router/index.js
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
```

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
const app = createApp(App)
app
.use(router)
.mount('#app')
```

#### 路由跳转的几种方式

```vue
<!-- 第一种方式，使用composition API， 需要导入vue-router -->
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const goLogin = () => {
 router.push('/login');
}
</script>

<!-- 或者 -->
<script>
import { useRouter } from 'vue-router';
export default {
  name: 'Welcome',
  setup(){
    const router = useRouter();
    function goLogin() {
      router.push('/login');
    }
    return  { goLogin }
  }
} 
</script>

<!-- 第二种方式，使用传统的options API -->
<script>
export default {
  name: 'Welcome',
  methods: {
    goLogin () {
      this.$router.push('/login')
    }
  }
}
</script>



<!-- 第三种方式，router-link -->
<template>
  <router-link to="/welcome">返回欢迎页</router-link>
</template>
```

因为我们在 `setup` 里面没有访问 `this`，所以我们不能再直接访问 `this.$router` 。作为替代，我们使用 `useRouter` 函数

`this.$router` 与直接使用通过 `createRouter` 创建的 `router` 实例完全相同。我们使用 `this.$router` 的原因是，我们不想在每个需要操作路由的组件中都导入路由。