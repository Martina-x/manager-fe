import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from "./router";
import request from './utils/request';

const app = createApp(App)

app
.use(router)
.use(ElementPlus)
.mount('#app')

console.log("环境变量=>", import.meta.env);

app.config.globalProperties.$request = request;
