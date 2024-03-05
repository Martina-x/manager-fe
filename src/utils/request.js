/**
 * axios二次封装
 */
import axios from "axios";
import { ElMessage } from 'element-plus';

import config from "./../config";
import router from "./../router";

const TOKEN_INVALID = 'token认证失败，请重新登录';
const NETWORK_INVALID = '网络请求错误，请稍后重试';

// 创建axios实例对象，添加全局配置
const service = axios.create({
  baseURL: config.baseApi,
  timeout: 8000,
});    

// 请求拦截
service.interceptors.request.use((req) => {
  // 判断是否携带jwt字段，若无则进行赋值，动态添加token
  const headers = req.headers;
  if (!headers.Authorization) headers.Authorization = 'SATAA'
  return req;
})

// 响应拦截
service.interceptors.response.use(req => {
  const { code, msg, data } = req.data;
  if (code === 200) {
    ElMessage.success(msg);
    return data; // 直接返回data即可，这样可以直接拿到数据，不需要在每个页面都调用then方法
  } else if (code === 500001) {
    // 登录拦截
    ElMessage.error(TOKEN_INVALID);
    setTimeout(() => {
      router.push('/login')
    }, 1500);
    // 抛出异常
    return Promise.reject(TOKEN_INVALID)
  }else {
    // 常规报错
    ElMessage.error(msg || NETWORK_INVALID);
    // 抛出异常
    return Promise.reject(msg || NETWORK_INVALID)
  }
})

/**
 * 请求核心函数
 * @param {*} options 请求配置
 */
function request(options) {
  options.method = options.method || 'get';
  if (options.method.toLowerCase() === 'get') {
    options.params = options.data; // get请求的参数名是params，post请求的参数名是data，但是在调用request的时候统一传入data字段，但是这里也还是要做一个转换，减少前端开发成本
  }
  if (typeof options.mock != 'undefined') {
    config.mock = options.mock;
  }
  // 接口地址一定不能搞错，特别要确保生产环境下baseURL是否用的是线上的baseApi，而不是mockApi，无论mock是否为true
  if (config.env === 'prod') {
    service.defaults.baseURL = config.baseApi; // 只要是生产环境都要指向baseApi
  }else {
    service.defaults.baseURL = config.mock ? config.mockApi : config.baseApi;
  }
  return service(options); // 最终调用的是service，然后将options传入
}

// 为构造函数request添加属性,以便通过request.method()来发送请求
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

export default request;
