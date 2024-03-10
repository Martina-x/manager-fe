/**
 * api管理
 */

import request from "@/utils/request";

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
      data: {},
      mock: true
    })
  },
  getMenuList(params) {
    return request({
      url: '/menu/list',
      method: 'post',
      data: params,
      mock: true
    })
  },
  getUserList(params) {
    return request({
      url: '/users/list',
      data: params,
      mock: true
    })
  },
  userDel(params) {
    return request({
      url: '/users/delete',
      method: 'post',
      data: params,
      mock: true
    })
  }
}