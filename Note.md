# 项目初始化

```json
{
  "scripts": {
    "dev": "vite --mode dev",
  },
}

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

- 请求拦截

  - 检查是否携带了token字段，若无则动态赋值

    登录成功后会将后端返回的userInfo数据存储到vuex和storage中，其中包含了token信息。请求拦截器中从storage中获取，添加到headers中的Authorization字段。

    ```js
    service.interceptors.request.use((req) => {
      // 判断是否携带jwt字段，若无则进行赋值，动态添加token
      const headers = req.headers;
      const token  = storage.getItem("userInfo")?.token;
      if (!headers.Authorization) headers.Authorization = 'Bearer ' + token;
      return req;
    })
    ```

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

  但是要注意的是，在api文件中手动设置了mock同时修改了`config`配置，如果之后的接口不再手动设置`mock`，那么将一直保持这个手动修改的`mock`作为`config.mock`值决定发送请求的地址。

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

## 连通后台

- 跨域配置

  ```js
  // vite.config.js
  export default defineConfig({
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
        }
      }
    }
  })
  ```

- 取消`mock`状态

  ```js
  // config/index.js
  /**
   * 环境配置封装
   */
  const EnvConfig = {
    dev: {
      baseApi: '/api'
    },
  }
  
  export default {
    mock: false,
  }
  ```

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240305175641396.png" alt="image-20240305175641396" style="zoom:50%;" />

# 首页

## 菜单交互及递归实现

此处要实现树形菜单，数据结构如下：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240306213312557.png" alt="image-20240306213312557" style="zoom:35%;" /><img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240306213333794.png" alt="image-20240306213333794" style="zoom:33%;" />

其中`parentId`为null表示当前菜单为一级菜单，比如“系统管理”，其子菜单定义在children中，比如“用户管理”，要注意的是“用户管理”菜单项children中的“新增”为按钮，区别是当menuType取值为1表示当前项为菜单，menuType取值为2表示当前项为按钮。

根据接口文档，树形菜单渲染结构如下。

```html
<el-sub-menu index="1">
  <template #title>
    <el-icon>
      <Setting />
    </el-icon>
    <span>系统管理</span>
  </template>
  <el-menu-item index="1-1">用户管理</el-menu-item>
  <el-menu-item index="1-2">菜单管理</el-menu-item>
  <el-menu-item index="1-3">角色管理</el-menu-item>
  <el-menu-item index="1-4">部门管理</el-menu-item>
</el-sub-menu>
<el-sub-menu index="2">
  <template #title>
    <el-icon>
      <Setting />
    </el-icon>
    <span>审批管理</span>
  </template>
  <el-menu-item index="2-1">休假申请</el-menu-item>
  <el-menu-item index="2-2">待我审批</el-menu-item>
</el-sub-menu>
```

为了提高效率，封装树形菜单组件。

```vue
<!-- TreeMenu.vue -->
<template>
  <template v-for="menu in userMenu">
    <el-sub-menu v-if="menu.children && menu.children.length > 0 && menu.children[0].menuType == 1" :index="menu.path">
      <template #title>
        <!-- <el-icon>
          <Setting />
        </el-icon> -->
        <component class="svgIcon" :is="menu.icon"></component>
        <span>{{ menu.menuName }}</span>
      </template>
      <tree-menu :userMenu="menu.children" />
    </el-sub-menu>
    <el-menu-item v-else-if="menu.menuType == 1" :index="menu.path">{{ menu.menuName }}</el-menu-item>
  </template>
</template>
          
<script>
export default {
  name: 'TreeMenu',
  props: {
    userMenu: {
      type: Array,
      default: []
    }
  }
}
</script>

<style scoped>
.svgIcon {
  width: 1.5em;
  height: 1.5em;
  margin-right: 5px;
}
</style>
```

- 若当前菜单项children有值并且有子菜单项（而非全是按钮），则判断为父级菜单，使用`el-sub-menu`渲染。当前菜单项的子级渲染在父菜单之下，故在`el-sub-menu`内部进行递归，放置`tree-menu`组件
- 若当前菜单项children没有值或者子级只有按钮，则判断为子级菜单使用`el-menu-item`渲染。

## 面包屑

```vue
<!-- BreadCrumb.vue -->
<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item v-for="(item, index) in breadList" :key="item.path">
      <router-link v-if="index == 0" to="/">{{ item.meta.title }}</router-link>
      <span v-else>{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { ArrowRight } from '@element-plus/icons-vue'
import { computed } from 'vue';
import { useRoute } from "vue-router";
export default {
  name: 'BreadCrumb',
  setup() {
    const route = useRoute()
    const breadList = computed(() => {
      return route.matched;
    });
    return { ArrowRight, breadList }
  }
}
</script>
```

为了检验面包屑效果，额外配置路由如下：

```js
import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./../components/Home.vue";

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
        component: () => import('../views/Welcome.vue'),
      },
      {
        name: 'User',
        meta: {
          title: '用户管理'
        },
        path: 'user',
        component: () => import('../views/Welcome.vue'),
        children: [
          {
            name: 'Info',
            meta: {
              title: '信息统计'
            },
            path: 'info',
            component: () => import('../views/Welcome.vue'),
          }
        ]
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
```

效果图：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240306235523576.png" alt="image-20240306235523576" style="zoom: 33%;" />

其中，在我们的路由设计中，面包屑的第二级即为当前页面了，所以只有第一级即“首页”需要配置路由跳转目标`to`，当点击首页后，页面切换如下：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240306235759128.png" alt="image-20240306235759128" style="zoom:33%;" />

> ==注意==
>
> 1. 关于`<el-breadcrumb :separator-icon="ArrowRight">`，官网给出的示例用的是组合式API，原本打算用选项式来着，但是无法获取到这个icon，控制台提醒`Property "ArrowRight" was accessed during render but is not defined on instance. `
> 2. `const route = useRoute()`一开始是定义在`computed`内部的，但是如果从`/welcome`手动输入`/user/info`并跳转会提示报错`TypeError: Cannot read properties of undefined (reading 'matched')`

# 角色管理

## RABC

Role-Base-Access-Control

**用户**分配角色 -> **角色**分配权限 -> **权限**对应菜单、按钮

用户登录之后，根据对应角色，拉取用户的所有权限列表，对菜单、按钮进行动态渲染

## 权限设置

在`el-tree`组件中，与复选框选中情况相关的几个属性`checkedNodes`、`checkedKeys`、`halfCheckedNodes`、`halfCheckedKeys `中，`halfCheckedKeys`。其中，当父菜单的所有子菜单被选中后，父菜单会认为是`checkedKeys`的一员。

但是在实际开发中，我们需要通过请求接口，获取角色权限列表`permissionList`中的`checkedKeys`，从而在打开某个角色的权限设置面板时自动勾选对应的权限。

对于请求接口获取的`checkedKeys`，我们可以直接通过调用Tree组件的`setCheckedKeys`方法设置目前选中的节点：

```js
handlePermissionOpen(row) {
  let { checkedKeys, halfCheckedKeys } = row.permissionList;
  this.$refs.treeRef.setCheckedKeys(checkedKeys)
},
```

需要注意的是，当直接执行上述代码时，第一次打开弹框，会报错`Uncaught TypeError: Cannot read properties of undefined (reading 'setCheckedKeys')`，第二次无报错并且可以正常选中结点。分析原因是还未来得及获取曲柄`treeRef`。

<img src="C:/Users/10175/AppData/Roaming/Typora/typora-user-images/image-20240319175933400.png" alt="image-20240319175933400" style="zoom:50%;" />

所以添加延时操作，修改如下：

```js
setTimeout(() => {
  this.$refs.treeRef.setCheckedKeys(checkedKeys);
});
```

当提交权限修改时，携带参数如下：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240319183407489.png" alt="image-20240319183407489" style="zoom:37%;" />

其中`_id`为打开权限弹框时保存好的`curRoleId`，而需要注意的是，参数`permissionList`中的`checkedKeys`和`halfCheckedKeys`并不是直接通过Tree组件的方法获得的，需要手动进行过滤操作。

因为Tree组件默认将所有子菜单都被选中的父菜单也视作`checkedKeys`，然后在项目中，如果我们新增了子菜单项且并未设置权限，那么`el-tree`会根据原始的`checkedKeys`将其也自动勾选，这是错误的。所以我们要对组件自身的`checkedKeys`中的父菜单过滤出来，将其视为半选中状态，使得`checkedKeys`只包含"新增"、“批量删除”等按钮，其余半选中父菜单保存在`halfCheckedKeys`中。

```js
async handlePerssionSubmit() {
  // 获取选中节点
  let nodes = this.$refs.treeRef.getCheckedNodes();
  // 获取半选中节点id
  let halfKeys = this.$refs.treeRef.getHalfCheckedKeys();
  let checkedKeys = []; // 过滤后的选中节点id
  let parentKeys = []; // 过滤出来的父菜单节点id
  // 将选中结点中的父菜单项过滤出来，区分菜单和按钮
  nodes.map(node => {
    if (!node.children) {
      checkedKeys.push(node._id);
    } else {
      parentKeys.push(node._id);
    }
  });
  let params = {
    _id: this.curRoleId,
    permissionList: {
      checkedKeys,
      halfCheckedKeys: parentKeys.concat(halfKeys)
    }
  };
  await this.$api.updatePermission(params);
},
```

## 权限列表递归处理

场景是根据角色的`halfCheckedKeys`在表格中展示按钮的父级菜单，同上文“权限设置”中一样用到了递归的方法。

```js
columns: [
  {
    label: '权限列表',
    prop: 'permissionList',
    formatter: (row, col, val) => {
      let list = val.halfCheckedKeys || [];
      let names = [];
      list.map(key => {
        const name = this.actionMap[key]
        if (key && name) {
          names.push(name);
        } 
      });
      return names.join(', ');
    }
  },
]
```

```js
// 菜单列表初始化
async getMenuList() {
  const list = await this.$api.getMenuList();
  this.getActionMap(list); // 获取菜单名称映射
},
  
// 生成菜单映射
getActionMap(list) {
  let actionMap = {};
  const deep = (arr) => {
    while (arr.length) {
      const item = arr.pop();
      if (item.children && item.action) {    // 子菜单为操作按钮
        actionMap[item._id] = item.menuName;
      }
      if (item.children && !item.action) {   // 还没有到最后一级，递归
        deep(item.children);
      }
    }
  }
  deep(JSON.parse(JSON.stringify(list))); // 避免污染list
  this.actionMap = actionMap;
}
```

<<<<<<< HEAD
# 工作流

概念：部分或整体业务实现计算机环境下的自动化。

使用到工作流的常见系统：OA、HR、ERP、CRM

使用到工作流的常见场景：加班、报销、出差、采购、报价、培训、考核、付款

工作流七要素：

- 角色：发起人、审批人
- 场景：请假、出差...
- 节点：审批单节点、多节点（比如发起一个申请，递交到A人事，但是A人事请假了，可以由B人事审批，可以被多个人进行审批，就是多节点）
- 环节：审批单环节、多环节
- 必要信息：申请理由、申请市场...
- 通知：申请人、审批人
- 操作：未审批、已驳回、已审批

## 动态菜单/按钮

请求`getPermissionList`接口的时候会返回`menuList`和`actionList`两个数据，分别表示菜单（包含按钮）权限列表和按钮权限列表。将数据存储到内存和vuex中，以供后续使用。

```js
// Home.vue
async getMenuList() {
  try {
    const { menuList, actionList } = await this.$api.getPermissionList();
    this.userMenu = menuList;
    this.$store.commit("saveUserMenu", menuList);
    this.$store.commit("saveUserAction", actionList);
  } catch (error) {
    console.error(error);
  }
}
  
// store/index.js
const state = {
  menuList: storage.getItem("menuList") || [],
  actionList: storage.getItem("actionList") || [],
}
// store/mutations.js
/**
 * Mutations业务层数据提交
 */
import storage from "../utils/storage"
export default {
  saveUserMenu(state, menuList) {
    state.menuList = menuList;
    storage.setItem("menuList", menuList); 
  },
  saveUserAction(state, actionList) {
    state.actionList = actionList;
    storage.setItem("actionList", actionList); 
  }
}
```

为了实现动态按钮，采用自定义指令的方式。

> https://cn.vuejs.org/guide/reusability/custom-directives.html#custom-directives



```js
// src/index.js
//将自定义指令全局注册到应用层级
app.directive('has', {
  beforeMount: (el, binding) => {
    // 获取权限按钮列表
    const actionList = storage.getItem('actionList');
    // 获取指定绑定的值。比如在
    let value = binding.value;
    // 判断列表中是否有对应按钮权限标识，可以通过arg或者value判断都行
    let hasPermission = actionList.includes(value);
    if(!hasPermission) {
      el.style = "display: none";
      setTimeout(() => {
        // 移除dom元素
        el.parentNode.removeChild(el);
      }, 0);
    }
  }
})
```

在自定义指令中，冒号后跟着的是参数`arg`，等号后跟着的是绑定值`value`，都是`binding`中的字段。以`v-has:add="'user-create'"`为例，`add`是参数，`user-create`为绑定值，并且需要注意的是如果绑定的值为一个字符串，那么必须像这里`'user-create'`，如果直接`"user-create"`，那么会把`user-create`判断为一个变量。

在移除使用自定义指令的dom元素时，之所以通过`setTimeout`，是因为这些逻辑是在`beforeMount`周期完成的，此时节点还在vdom节点中，还没有渲染到真正的dom中，无法直接删除。所以通过`setTimeout`添加一个宏任务，放在堆栈中，下次轮询的时候再来删除dom元素。

## 导航守卫

添加前置守卫，如果路径不存在则跳转到404页面

```js
// router/index.js
// 导航守卫
router.beforeEach((to, from, next) => {
  if (router.hasRoute(to.name)) {
    document.title = to.meta.title;
    next();
  }else {
    next('/404');
  }
})
```

> 另一种判断的方式：
>
> ```js
> // 判断当前地址是否可以访问
> function checkPermission(path) {
>   	let hasPermission = router.getRoutes().filter(route => route.path == path).length;
>   	if (hasPermission) {
>        return true;
>   	} else {
>     		return false;
>   	}
> }
> 
> // 导航守卫
> router.beforeEach((to, from, next) => {
>   	if (checkPermission(to.path)) {
>     	document.title = to.meta.title;
>     	next();
>   	}else {
>    	 next('/404');
>   	}
> })
> ```
> 
> 这两种方式都可以用来判断当前路由是否存在，前一种是通过`name`来判断，这一种是通过`path`来判断

## 动态路由

> 教程的演示代码：
>
> <img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240525004619243-17166469622551.png" alt="image-20240525004619243" style="zoom: 50%;" />
>
> <img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240525004624376-17166469700594.png" alt="image-20240525004624376" style="zoom:50%;" />

**思路**：从菜单权限例表`menuList`中提取菜单项，再通过`router.addRoute()`添加路由。

根据`menuList`动态拼接路由的函数`generateRoute`抽取到公共方法中：

```js
// utils/utils.js
export default {
  // 动态拼接路由
  generateRoute(menuList) {
    let routes = [];
    const deep = list => {
      list.forEach(item => {
        if (item.action) {
          routes.push({
            name: item.component,
            meta: {
              title: item.menuName,
            },
            path: item.path,
            component: item.component
          })
        }
        if (item.children && !item.action) {
          deep(item.children);
        }
      });
    }
    deep(menuList);
    return routes;
  }
}
```

根据菜单模块的设计，路由的`name`、`meta.title`、`path`、`component`都可以从`menuList`的菜单中提取到。

将路由文件中的静态路由只保留跟页面和登陆页面，其他的路由通过获取权限列表后动态添加

```js
// router/index.js
async function loadAsyncRoutes() {
  // 判断用户是否已登录
  let userInfo = storage.getItem('userInfo') || {};
  if (userInfo.token) {
    try {
      const { menuList } = await api.getPermissionList();
      let routes = utils.generateRoute(menuList);
      const modules = import.meta.glob('../views/*.vue');
      routes.forEach((route) => {
        let url = `../views/${route.component}.vue`;
        route.component = modules[url];
        router.addRoute("Home", route);
      })
    } catch (error) {
      console.log(error);
    }
  }
}
await loadAsyncRoutes();
```

要注意的是，页面文件的命名最好不要太复杂，创建菜单的时候也不需要填入完整的路径，因为一般情况下页面文件都是固定在`views`目录下的，所以只需要知道文件名称，然后通过代码动态控制地址会更方便了。像这里`routes`的结构如下：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526015536259.png" alt="image-20240526015536259" style="zoom:50%;" />

在动态加载路由的时候，`compoennt`的地址：

- 地址需要添加.vue后缀
- 不可以使用`@/views`

另外，很重要的一点。在这里动态导入路由的时候，使用了vite的glob导入，而不是像最上方演示代码给出的`()=>import(url)`。

首先来看一下代码改成直接`import`导入的效果。

```js
routes.forEach((route) => {
  let url = `../views/${route.component}.vue`;
  route.component = () => import(url);
  // route.component = modules[`../views/${route.component}.vue`];
  router.addRoute("Home", route);
})
```

此时，动态添加路由的页面<u>可以正常访问</u>，但是控制台会有警告：

![image-20240526021132878](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526021132878.png)

在通过`addRoute`添加路由前，打印`route.component`：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526021426295.png" alt="image-20240526021426295" style="zoom:50%;" />

这个信息表示在`vite`中动态导入的时候有出错，查了网上有说是不能使用模板字符串导入动态路由，而在演示代码中将url单独提出来再使用`import(url)`好像也是因为避免这个原因。但现在这样的代码一样会显示这样的信息。

另一方面，通过打印`router.getRoutes()`来看一下现在的路由表：

![image-20240526021820572](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526021820572.png)

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526021851480.png" alt="image-20240526021851480" style="zoom:50%;" />

这里给出的两个都是动态导入的路由，咱就是也不知道为什么`components`在路由表中的表现为什么不同。并且这个时候发现，在路由表中，新导入的这两个组件并没有像`addRoute("Home",route)`设想的一样出现在名为`Home`的路由下的`children`属性中，也就是他们直接出现在了根目录下，但是其实静态路由中Home组件原本也有一个子路由，这个路由是早就定义好的不是动态加入的，Home组件的children中有这个路由，但是同时这个路由一样出现在根目录下。在这里我一开始认为的是并没有成功把两个新的路由添加为Home的子路由。

这个问题真的是，我感觉查遍了全网，都没找到一个说清楚的，也都是说为什么动态添加的路由都添加成了一级的路由。有的说是`addRoute`第一个参数`parentName`没有写对，要写父路由的`name`属性值，但是这个问题我也确实没有出错。后来想着说既然页面可以成功访问，也就是路由确实添加进来了，层级对不对先不说，那就看一下添加进来的路由的父路由是怎么样的吧。

在前置守卫中把参数`to`打印看一下：

![image-20240526023240616](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526023240616.png)

这里的`matched`数组包含了当前路径匹配到的所有路由记录，按照从上至下的顺序排列，即从父路由到子路由。可以看到父路由又确实是`Home`，所以其实也确实把动态加入的这个`User`添加为了`Home`的子路由。

ok，fine那就不纠结这个问题了。

提回一开始vite的警告`The above dynamic import cannot be analyzed by Vite.`，查了资料是说要换成vite的`glob`导入。代码修改如下：
```js
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
```

[vite文档](https://cn.vitejs.dev/guide/features.html#dynamic-import)提到匹配到的文件默认是懒加载的，通过动态导入实现，glob导入结果`modules`打印如下：

![image-20240526024634989](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526024634989.png)

此时再打印`route.component`就是稳定的：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526024825942.png" alt="image-20240526024825942" style="zoom:67%;" />

不过这里关于新的路由表，我也不是很懂为什么这两个的`components`表现也有区别就是了：

![image-20240526025045750](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526025045750.png)

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526025115645.png" alt="image-20240526025115645" style="zoom:50%;" />

此时会发现有另一个问题，第一次页面跳转的时候报404，因为第一次导航守卫的时候还没有添加动态路由。直接粗暴在导航守卫中添加调用`loadAsyncRoutes`的代码，解决。==笔记可补充==

# 参考文章

[Vue-Router根据用户权限添加动态路由（侧边栏菜单）](https://www.yuezeyi.com/502.html)

[Vue3和vite项目踩炕提示The above dynamic import cannot be analyzed by Vite.](https://www.yuezeyi.com/499.html)

# 部门管理

## 自动匹配负责人邮箱

创建/编辑的弹窗内容如下：

<img src="D:/Documents/Typora/Pic/Note/image-20240526091432753.png" alt="image-20240526091432753" style="zoom:50%;" />

**要点1**：上级部门初始值为`[null]`，因为创建一级部门时无上级部门，但是校验规则上级部门为必填项

**要点2**：负责人邮箱是禁止修改的，但是它的值会根据“负责人”的变化而自动变化。实现思路是，提前获取所有用户列表，当字段名为”负责人“的select发生变化时，同时保留该用户对应的”用户邮箱“属性值，赋值给表单的”负责人邮箱“字段。

代码框架如下

```vue
<template>
  <el-form :model="dialogForm" ref="dialogFormRef" :rules="rules" label-width="100px">
    <el-form-item label="负责人" prop="user">
      <el-select v-model="dialogForm.xxx" @change="handleUser">
        <el-option
          v-for="item in userList"
          :key="item.userId"
          :label="item.userName"
          :value="..."
        />
      </el-select>
    </el-form-item>
    <el-form-item label="负责人邮箱" prop="userEmail">
      <el-input disabled v-model="dialogForm.userEmail"></el-input>
    </el-form-item>
  </el-form>
</template>
```

`el-option`不用说，遍历的是全部用户列表`userList`，对于每个元素，我们用到的属性有`userId`，`userName`，`userEmail`，其中`userId`作为唯一`key`，`userName`作为`select`显示的值，`userEmail`用作`dialogForm.userEmail`的值，并且这三个值都是表单需要提交的数据。

显然`dialogForm.userEmail`无法编辑，但是通过`handleUser`监听select选择器中`v-model`值的变化，可以从而修改表单中的`userId`，`userName`，`userEmail`。所以select选择器绑定的值`value`不能仅是`userName`，因为除此之外没有别的渠道可以灵活提取对应的`userEmail`，换个思路，我们将`userId`，`userName`，`userEmail`都保存在这个`value`里，反正显示值`label`是`item.userName`就可以了。此时设这个表单项对应的字段是`dialogForm.user`，之后如果要提交表单提炼出所需的数据，然后再删除这个字段就好了。上述代码修改为：

```vue
<template>
  <el-form :model="dialogForm" ref="dialogFormRef" :rules="rules" label-width="100px">
    <el-form-item label="负责人" prop="user">
      <el-select placeholder="请选择部门负责人" v-model="dialogForm.user" @change="handleUser">
        <el-option
          v-for="item in userList"
          :key="item.userId"
          :label="item.userName"
          :value="`${item.userId}/${item.userName}/${item.userEmail}`"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="负责人邮箱" prop="userEmail">
      <el-input disabled placeholder="请输入负责人邮箱" v-model="dialogForm.userEmail"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      userList: [],
      dialogForm: {
        parentId: [null]
      },
      user: {
        userId: "",
        userName: "",
        userEmail: ""
      },
    }
  },
  mounted() {
    this.getAllUserList();
  },
  methods: {
    async getAllUserList() {
      this.userList = await this.$api.getAllUserList();
    },
    handleUser(val) {
      const [userId, userName, userEmail] = val.split('/');
      // 更新表单中的userId, userName, userEmail字段
      Object.assign(this.dialogForm, {userId, userName, userEmail});
    },
    handleEdit(row) {
      this.action = "edit";
      this.dialogVisible = true;
      this.$nextTick(()=> {
        // 编辑部门信息时，根据row的数据，拼接dialogForm.user,作为select选择器的绑定值
        Object.assign(this.dialogForm, row, {
          user: `${row.userId}/${row.userName}/${row.userEmail}`
        });
      })
    },
    handleSubmit() {
      this.$refs['dialogFormRef'].validate(async (valid) => {
        if (valid) {
          let params = {...this.dialogForm, action: this.action};
          // 在提交表单之前删去多余的user字段
          delete params.user;
          // 请求接口，提交数据
        }
      })
    }
  }
}
</script>
```

# 休假申请

## ==遇到问题==

```vue
<template>
  <div class="user-manager">

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">申请休假</el-button>
      </div>
    </div>
    <el-dialog
      v-model="showModel"
    >
      <el-form :model="dialogForm" label-width="120px" :rules="rules" ref="dialogFormRef">
        <el-form-item prop="applyType" label="休假类型" required>
          <el-select v-model="dialogForm.applyType" style="width: 140px">
            <el-option label="事假" :value="1" />
            <el-option label="调休" :value="2" />
            <el-option label="年假" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="休假时间" required>
          <el-row>
            <el-col :span="10">
              <el-form-item prop="startTime">
                <el-date-picker v-model="dialogForm.startTime" type="datetime" placeholder="选择开始日期"/>
              </el-form-item>
            </el-col>
            <el-col :span="2" style="text-align:center">-</el-col>
            <el-col :span="10">
              <el-form-item prop="endTime">
                <el-date-picker v-model="dialogForm.endTime" type="datetime" placeholder="选择结束日期"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="休假时长" prop="leaveTime" required>0天</el-form-item>
        <el-form-item label="休假原因" prop="reasons">
          <el-input v-model="dialogForm.reasons" type="textarea" :rows="3" placeholder="请输入休假原因" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  setup() {
    // 创建休假弹框表单
    const dialogForm = reactive({
      applyType: 1,
      startTime: "",
      endTime: "",
      leaveTime: "0天",
      reasons: ""
    });
    const action = ref("create");
    const showModel = ref(false);
    // 点击申请休假-展示弹框
    const handleCreate = () => {
      showModel.value = true;
      action.value = "create";
    }
  }
}
</script>
```

通过上述代码实现弹框：

<img src="D:/Documents/Typora/Pic/Note/image-20240526165401228.png" alt="image-20240526165401228" style="zoom:50%;" />

其中通过嵌套的方式将`startTime`和`endTime`分别包裹在一个`el-form-item`中的同时也被一个`el-form-item`包裹，是为了实现这两者在同一行，但是并不作为同一个表单项。

当第一次点击“申请休假”按钮时，响应式的showmodel值修改为true，弹框可以正常打开，但此时控制台发出警告。但是弹框可以正常打开：

![](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526170419782-17167142863911.png)

如果直接搜索报错信息提示的是跟计算属性有关的什么脏值之类的，但是这里也没用到`computed`。排查之后发现就是这块嵌套的代码影响了

```vue
<el-form-item label="休假时间" required>
  <el-row>
    <el-col :span="10">
      <el-form-item prop="startTime">
        <el-date-picker v-model="dialogForm.startTime" type="datetime" placeholder="选择开始日期"/>
      </el-form-item>
    </el-col>
    <el-col :span="2" style="text-align:center">-</el-col>
    <el-col :span="10">
      <el-form-item prop="endTime">
        <el-date-picker v-model="dialogForm.endTime" type="datetime" placeholder="选择结束日期"/>
      </el-form-item>
    </el-col>
  </el-row>
</el-form-item>
```

看了一下vue devtools，有这样的一个耗时分析：

![image-20240526171119232](D:/Documents/Typora/Pic/Note/image-20240526171119232.png)

不清楚是不是跟耗时过多有关，跟其他的对比确实很大。

<img src="D:/Documents/Typora/Pic/Note/image-20240526171206515.png" alt="image-20240526171206515" style="zoom:50%;" />

elementplus文档其实也有这种嵌套的写法（代码都是差不多的），拷贝过来之后发现同样也会出现这个警告的问题。

<img src="D:/Documents/Typora/Pic/Note/image-20240526171308886.png" alt="image-20240526171308886" style="zoom:33%;" />

<img src="D:/Documents/Typora/Pic/Note/image-20240526171302906.png" alt="image-20240526171302906" style="zoom:50%;" />

## 创建休假申请

弹框UI实现如下：

<img src="https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240526213126375.png" alt="image-20240526213126375" style="zoom:50%;" />

### 计算休假时长

相关代码如下：

```vue
<template>
  <div class="user-manager">
    <el-dialog v-model="showModel" title="申请休假" :close-on-click-modal="false" :close-on-press-escape=false
      @close="resetForm('dialogFormRef')">
      <el-form :model="dialogForm" label-width="120px" :rules="rules" ref="dialogFormRef">
        <el-form-item label="休假时间" required>
          <el-row>
            <el-col :span="10">
              <el-form-item prop="startTime">
                <el-date-picker v-model="dialogForm.startTime" type="datetime" placeholder="选择开始日期" @change="(val) => handleDateChange('startTime', val)"/>
              </el-form-item>
            </el-col>
            <el-col :span="2" style="text-align:center">-</el-col>
            <el-col :span="10">
              <el-form-item prop="endTime">
                <el-date-picker v-model="dialogForm.endTime" type="datetime" placeholder="选择结束日期" @change="(val) => handleDateChange('endTime', val)"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="休假时长" prop="leaveTime" required>
          {{ dialogForm.leaveTime }}
        </el-form-item>
      </el-form> 
    </el-dialog>
  </div>
</template>

<script>
export default {
  setup() {
    // 创建休假弹框表单
    const dialogForm = reactive({
      applyType: 1,
      startTime: "",
      endTime: "",
      leaveTime: "0天",
      reasons: ""
    });

    // 获取休假时长
    const handleDateChange = (key, val) => {
      const { startTime, endTime } = dialogForm;
      if(!startTime || !endTime) return;
      if(startTime > endTime) {
        proxy.$message.error("开始时间不能晚于结束时间");
        setTimeout(() => {
          dialogForm[key] = "0天";
        }, 0)
        return;
      } else {
        dialogForm.leaveTime = Math.round((endTime - startTime) / ( 24 * 60 * 60 * 1000) + 1) + '天'
      }
    }
  }
}
</script>
```

通过在`startTime`和`endTime`对应的时间选择器上绑定`change`事件获取两个字段值的变化，从而计算休假时长`leaveTime`

```vue
<el-date-picker @change="(val) => handleDateChange('startTime', val)"/>
<el-date-picker @change="(val) => handleDateChange('endTime', val)"/>
```

形式是一个回调函数，调用`handleDateChange`函数，并指明当前变化的`key`，否则控件调用同一个方法无法区分是哪个字段值在变化。

`leaveTime`的计算要求：

- `startTime`和`endTime`均不为空，且`startTime`不能大于`endTime`
- `endTime`-`startTime`的结果是毫秒为单位，所以需要÷(24 * 60 * 60 * 1000)，商再加一

## 查看休假详情

看一下UI的实现

<img src="D:/Documents/Typora/Pic/Note/image-20240527183732839.png" alt="image-20240527183732839" style="zoom:33%;" />

详情弹窗内容包括步骤条和表单两部分。

首先来看表单部分内容，这里的详情信息是有对原数据进行一个转换的。

```vue
<template>
  <div class="user-manager">
    <el-dialog v-model="showDetailModal" title="申请休假详情" :close-on-click-modal="false" :close-on-press-escape=false destroy-on-close>
      <el-steps style="max-width: 600px" :space="200" :active="detail.applyState > 2 ? 3 : detail.applyState" align-center>
        <el-step title="待审批" />
        <el-step title="审批中" />
        <el-step title="审批通过/拒绝" />
      </el-steps>
      <el-form label-width="120px" label-suffix=":">
        <el-form-item label="休假类型">
          <div>{{ detail.applyTypeName }}</div>
        </el-form-item>
        <el-form-item label="休假时间">
          <div>{{ detail.time }}</div>
        </el-form-item>
        <el-form-item label="休假时长">
          <div>{{ detail.leaveTime }}</div>
        </el-form-item>
        <el-form-item label="休假原因">
          <div>{{ detail.reasons }}</div>
        </el-form-item>
        <el-form-item label="审批状态">
          <div>{{ detail.applyStateName }}</div>
        </el-form-item>
        <el-form-item label="审批人">
          <div>{{ detail.curAuditUserName }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>

</template>

<script>
export default {
  setup() {
    // 创建休假申请详情表单
    let detail = ref({});
    const showDetailModal = ref(false);
    
    // 查看申请详情
    const handleDetail = (row) => {
      let data = {...row}; // {1}
      data.applyTypeName = {
        1: '事假',
        2: '调休',
        3: '年假'
      }[data.applyType];
      data.time = utils.formatDate(new Date(data.startTime), "yyyy-MM-dd") + '到' + utils.formatDate(new Date(data.endTime), "yyyy-MM-dd");
      data.applyStateName = {
        1: "待审批",
        2: "审批中",
        3: "审批拒绝",
        4: "审批通过",
        5: "作废"
      }[data.applyState]
      detail.value = data;
      showDetailModal.value = true;
    }
}
</script>
```

原数据在点击“查看”按钮时通过`scope.row`传递，{1}对其进行浅拷贝，然后再根据数据设计添加表单中显示的`applyTypeName`、`applyStateName`等字段。

> 这里的`detail`依然是通过`ref`来初始化的，不用`reactive`的原因是这样通过`detail = data;`更新会把`detail`覆盖掉，不再是一个响应式对象。如果是直接定义为一个常量`{}`，那么无法通过`detail = data;`绑定`detail`，因为这里`detail`默认为空，所以挂载上去的时候也为空，当弹出详情框的时候直接赋值，这个时候双向绑定已经失效了，因为初始化是空，当弹框弹出来的时候没有办法去赋值，`detail=data`已经把他变成一个变量。这不同于`rules`，它是直接挂载的能够直接解析，不需要双向绑定。而弹框默认是关闭的，如果是直接赋值没有问题，但是弹框重新弹出来无法把值赋上去。
>
> 说的口水话一点，我的理解是：初始化detail={}的时候，双向绑定认定的其实是{}这个对象的地址，这个时候的`detail`也是表示这个地址，然后指向{}。当执行detail=data的时候相当于将detail的指向改变为 data 对象，然后vue认定绑定的对象依然是一开始那个地址，而它自身没有变化，还是一个{}空对象，所以弹框无法显示`data`中的数据。

步骤条组件的状态改变只需要根据`applyState`控制`active`属性即可，其中要注意的是，查看不同状态的详情信息时，有可能出现步骤条组件状态不正确的现象，原因是弹框里面有缓存，所以添加了`destroy-on-close`属性，在弹框关闭时销毁。但其实做到这里的时候我没有出现组件状态不正确的问题，可能是版本或者其他原因吧，这里也连带记录一下。

# 待我审批模块

## 列表展示

组件页面qian在“休假申请”页面的基础上进行修改，表格组件中添加“申请人”一列。列表展示规则是，每个用户只能看到需要自己参与审批的申请。请求待审批列表的接口与请求请假申请列表的接口是共用的，区别在于前者的请求参数会多一个字段`type:"approve"`。

另外，对于“审核”按钮的显示，规则是用户是申请的当前审核人且申请处于“待审核”（当前用户是一级审核人）或“审核中”（当前用户不是一级审核人，前面的审核人都予以通过了）的状态。

## 待审核通知

**思路**：待审核数量随审核操作发生改变，绑定该值的`Badge`组件在`Home`组件中，所以需要使用Vuex来管理数据。审核操作 -> 请求接口 -> 更新Vuex。

在`handleApprove`的逻辑代码最后，通过`proxy.$store.commit('saveNoticeCount', proxy.$store.state.noticeCount - 1);`更新Vuex中的`noticeCount`，这里之所以用`store.state.noticeCount - 1`来更新，而不是`applyList.length`来更新，原因是，`applyList`并不一直是“待我审批”列表。

在`Home`组件中，使用`computed`监听vuex中`noticeCount`的变化，动态更新页面的`noticeCount`

相关代码如下：

store/index.js

```diff
/**
 * Vuex状态管理
 */

import { createStore } from "vuex";
import storage from "../utils/storage";
import mutations from "./mutations";

const state = {
  userInfo: storage.getItem("userInfo") || {},
  menuList: storage.getItem("menuList") || [],
  actionList: storage.getItem("actionList") || [],
+ noticeCount: 0
}

export default createStore({
  state,
  mutations
})
```

store/mutation.js

```js
/**
 * Mutations业务层数据提交
 */
import storage from "../utils/storage"
export default {
  saveNoticeCount(state, noticeCount) {
    state.noticeCount = noticeCount;
    storage.setItem("noticeCount", noticeCount); 
  }
}
```

Approve.vue

```diff
const handleApprove = async (action) => {
  proxy.$refs.dialogFormRef.validate(async valid => {
    if (valid) {
      let params = {
        _id: detail.value._id,
        remark: dialogForm.remark,
        action: action
      }
      try {
        const res = await proxy.$api.handleApprove(params);
        proxy.$message.success("操作成功");
        handleClose();
        getApplyList();
+       proxy.$store.commit('saveNoticeCount', proxy.$store.state.noticeCount - 1);
      } catch (error) {
      }
    }
  })
}
```

Home.vue

```diff
- <el-badge class="notice" :is-dot="noticeCount > 0 ? true : false" type="danger">
+ <el-badge class="notice" :value="noticeCount > 0 ? noticeCount : ''" type="danger" @click="$router.push('/audit/approve')">
  <el-icon><Bell /></el-icon>
</el-badge>
         

export default {
  data() {
    return {
-     noticeCount: 0,
    }
  },
+ computed: {
+   noticeCount() {
+     return this.$store.state.noticeCount
+   }
+ },
  methods: {
    async getNoticeCount() {
      try {
        const count = await this.$api.noticeCount();
-       this.noticeCount = count;
+       this.$store.commit('saveNoticeCount', count);
      } catch (error) {
        console.error(error); 
      }
      
    },
  }
}
</script>
```

