import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from "./router";
import request from './utils/request';
import storage from './utils/storage';
import api from "./api";
import store from "./store";

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.directive('has', {
  beforeMount: (el, binding) => {
    // 获取权限按钮列表
    const actionList = storage.getItem('actionList');
    let value = binding.value;
    // 判断列表中是否有对应按钮权限标识
    let hasPermission = actionList.includes(value);
    if(!hasPermission) {
      el.style = "display: none";
      setTimeout(() => {
        el.parentNode.removeChild(el);
      }, 0);
    }
  }
})

app
.use(router)
.use(ElementPlus, { size: 'small', zIndex: 3000 })
.use(store)
.mount('#app')

console.log("环境变量=>", import.meta.env);

app.config.globalProperties.$request = request;
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$api = api;

