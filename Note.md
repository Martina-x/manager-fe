# 项目初始化

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



# 路由封装

## 路由配置和全局导入

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



# axios二次封装

- 创建axios实例

- 请求封装

  - 检查是否携带了token字段，若无则动态赋值

- 响应拦截

  - 判断状态码

- 封装请求核心函数request

  - 判断`method`有无，若无则默认`get`请求

  - 确保接口地址是正确的，特别要确保生产环境下baseURL是否用的是线上的baseApi，而不是mockApi，无论mock是否为true

    ```js
    if (config.env === 'prod') {
        service.defaults.baseURL = config.baseApi; // 只要是生产环境都要指向baseApi
      }else {
        service.defaults.baseURL = config.mock ? config.mockApi : config.baseApi;
      }
    ```

  - 最终调用的是service，然后将options传入，`return service(options);`

- 为了能够通过`request.method()`来发送请求：

  ```js
  ['get', 'post', 'put', 'delete', 'patch'].forEach(item => {
    request[item] = (url, data, options) => {
      return request({
        method: item,
        url, 
        data, 
        ...options
      });
    }
  })
  ```

  其实就是一样调用`request`，只不过把`method`通过`item`来赋值

- 挂载

  ```js
  // main.js
  import { createApp } from 'vue'
  import App from './App.vue'
  import request from './utils/request';
  const app = createApp(App)
  app.config.globalProperties.$request = request;
  ```

- 两种调用方式

  - `this.$request`

    ```js
    this.$request({
          method: 'get',
          url: '/login',
          data: {
            name: 'sataa'
          }
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.error(err);
        })
    ```

  - `this.$request.method`

    ```js
    this.$request.get('/login', {name: 'sataa'}, {mock: true, loading: true}).then(res => {
          console.log(res);
        })
    ```

- 封装到api目录下集中管理

  ```js
  // api/index.js
  import request from './../utils/request'
  export default {
    login(params) {
      request({
        url: '',
        data: params,
        mock: true
      })
    }
  }
  
  // Login.vue
  this.$api.login(...)
  ```

  不能用`this`获取`request`，虽然先前封装的`request`已经挂载到`main.js`上，但是这个`index`文件不在vue组件实例中，所以访问不到vue对象.

  虽然在前面的`config/index.js`中设置了全局`mock`为`true`，但是这里的局部`mock`优先级要更高，对封装的`request`方法做修改：

  ```js
  if(typeof options.mock != 'undefined') {
    config.mock = options.mock;
  }
  ```

  

  最后也要将这个`index`文件进行挂载

# storage二次封装

封装的目的是为了统一管理，不需要每次都调用`window.loaclStorage.xxx`，加之storage只能存入字符串类型的数据，所以要进行封装。

当项目比较复杂或者同时多个项目的时候，同名变量可能会有覆盖的风险（同一个浏览器），所以在这里提出一个命名空间namespace的概念，写在配置文件中统一管理，之后基于命名空间存取数据。

封装：不要忘记JSON序列化和反序列化

```js
// utils/storage.js
/**
 * Storage二次封装
 */
import config from "./../config";

export default {
  getStorage() {
    return JSON.parse(window.localStorage.getItem(config.namespace) || "{}");
  },
  setItem(key, val) {
    let storage = this.getStorage();
    storage[key] = val;
    window.localStorage.setItem(config.namespace, JSON.stringify(storage));
  },
  getItem(key) {
    return this.getStorage()[key];
  },
  clearItem(key) {
    let storage = this.getStorage();
    delete storage[key];
    window.localStorage.setItem(config.namespace, JSON.stringify(storage));
  },
  clearAll() {
    window.localStorage.clear();
  }
}
```

挂载：

```js
// main.js
import storage from './utils/storage';
app.config.globalProperties.$storage = storage;
```



# 登录

## 表单设计

```vue
<el-form ref="userForm" :model="user" :rules="rules" status-icon>
  <el-form-item prop="userName">
    <el-input type="text" prefix-icon="User" v-model="user.userName" />
  </el-form-item>
  <el-form-item>
    <el-button class="btn-login" type="primary" @click="login">登录</el-button>
  </el-form-item>
</el-form>
```

校验规则

```js
data() {
  return {
    user: {
      userName: '',
      userPwd: ''
    },
    rules: {
      userName: {
        required: true, message: "请输入用户名", trigger: "blur"
      }
    }
  }
}
```

`el-form`上的ref用于操作原生dom

```js
login() {
  // 校验
  this.$refs.userForm.validate((valid)=>{
    if(valid) {
      // ...
    }else{
      // ...
    }
  })
}
```

## 接口请求

```js
// api/index.js
import request from './../utils/request'
export default {
  login(params) {
    request({
      url: '',
      data: params,
      mock: true
    })
  }
}

// Login.vue
this.$api.login(this.user).then(res => {...})
```

## 数据存储

vuex的使用逻辑是，通过用户行为dispatch一个action，进而commit一个mutation，mutation保存状态

```js
// store/index.js
/**
 * Vuex状态管理
 */
import { createStore } from "vuex";
import storage from "../utils/storage";
import mutations from "./mutations";

const store = {
  userInfo: "" || storage.getItem("userInfo")
}

export default createStore({
  store,
  mutations
})
```

封装Mutations业务层数据提交，修改state中的数据时，也要更新storage中的数据

```js
// store.mutations.js
/**
 * Mutations业务层数据提交
 */
import storage from "../utils/storage"
export default {
  saveUserInfo(state, userInfo) {
    state.userInfo = userInfo;
    storage.setItem("userInfo", userInfo); 
  }
}
```

加载store

```js
// main.js
import store from "./store";
app.use(store)
```

`.use`用于插件加载，其内部会把对象挂载globalProperty上

使用vuex存储数据

```js
// Login.vue
this.$store.commit("saveUserInfo", res);
```



