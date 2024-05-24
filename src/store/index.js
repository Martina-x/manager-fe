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
}

export default createStore({
  state,
  mutations
})