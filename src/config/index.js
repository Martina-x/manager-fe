/**
 * 环境配置封装
 */
const env = import.meta.env.MODE || 'prod';
const EnvConfig = {
  dev: {
    baseApi: '/api',
    mockApi: 'https://dev.usemock.com/65cf84576309cc7a37782edd'
  },
  test: {
    baseApi: '//test.futurefe.com/api',
    mockApi: 'https://dev.usemock.com/65cf84576309cc7a37782edd'
  },
  prod: {
    baseApi: '//futurefe.com/api',
    mockApi: 'https://dev.usemock.com/65cf84576309cc7a37782edd'
  }
}

export default {
  env,
  mock: true,
  namespace: 'manager',
  ...EnvConfig[env]
}