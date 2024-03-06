/**
 * api管理
 */

import request from "./../utils/request";

export default {
  login(params) {
    return request({
      url: '/users/login',
      method: 'post',
      data: params
    })
  },
  noticeCount() {
    return request({
      url: '/leave/count',
      data: {}
    })
  },
  getMenuList(params) {
    return request({
      url: '/menu/list',
      method: 'post',
      data: params
    })
  },
}