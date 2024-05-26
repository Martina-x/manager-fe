/**
 * api管理
 */

import request from "@/utils/request";

export default {
  login(params) {
    return request({
      url: '/users/login',
      method: 'post',
      data: params,
      mock: false
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
      data: params,
      mock: false
    })
  },
  getPermissionList() {
    return request({
      url: '/users/getPermissionList',
      data: {},
      mock: false
    })
  },
  getUserList(params) {
    return request({
      url: '/users/list',
      data: params,
      mock: false
    })
  },
  getAllUserList() {
    return request({
      url: '/users/all/list',
      data: {},
      mock: false
    })
  },
  userDel(params) {
    return request({
      url: '/users/delete',
      method: 'post',
      data: params,
      mock: false
    })
  },
  getRoleAllList() {
    return request({
      url: '/roles/allList',
      method: 'get',
      data: {},
      mock: false
    })
  },
  getRoleList(params) {
    return request({
      url: '/roles/list',
      data: params,
      mock: false
    })
  },
  getDeptList(params) {
    return request({
      url: '/dept/list',
      method: 'get',
      data: params,
      mock: false
    })
  },
  deptSubmit(params) {
    return request({
      url: '/dept/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  userSubmit(params) {
    return request({
      url: '/users/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  menuSubmit(params) {
    return request({
      url: '/menu/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  roleSubmit(params) {
    return request({
      url: '/roles/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  updatePermission(params) {
    return request({
      url: '/roles/update/permission',
      method: 'post',
      data: params,
      mock: false
    })
  },
  getApplyList(params) {
    return request({
      url: '/leave/list',
      method: 'get',
      data: params,
      mock: true
    })
  }
}