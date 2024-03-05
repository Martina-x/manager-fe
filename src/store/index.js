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