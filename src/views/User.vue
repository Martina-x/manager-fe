<template>
  <div class="user-manager">
    <div class="query-form">
      <el-form :inline="true" :model="user">
        <el-form-item label="用户ID">
          <el-input v-model="user.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="user.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="user.state" placeholder="请选择用户状态" style="width: 140px">
            <el-option label="所有" :value="0" />
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="2" />
            <el-option label="试用期" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </div>
      <el-table :data="userList">
        <el-table-column type="selection" width="55" />
        <el-table-column v-for="item in columns" :prop="item.prop" :label="item.label" :width="item.width" />
        <el-table-column fixed="right" label="操作" width="125">
          <template #default>
            <el-button size="mini">编辑</el-button>
            <el-button type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"></div>
    </div>
  </div>

</template>
          
<script>
import { reactive, ref } from 'vue';

export default {
  name: 'User',
  setup() {
    // 初始化用户表单对象
    const user = reactive({});
    // 初始话用户列表数据
    const userList = ref([
      {
        "state": 1,
        "role": "0",
        "roleList": [
          "60180b07b1eaed6c45fbebdb",
          "60150cb764de99631b2c3cd3",
          "60180b59b1eaed6c45fbebdc"
        ],
        "deptId": [
          "60167059c9027b7d2c520a61",
          "60167345c6a4417f2d27506f"
        ],
        "userId": 1000002,
        "userName": "admin",
        "userEmail": "admin@imooc.com",
        "createTime": "2021-01-17T13:32:06.381Z",
        "lastLoginTime": "2021-01-17T13:32:06.381Z",
        "__v": 0,
        "job": "前端架构师",
        "mobile": "17611020000"
      }
    ]);
    // 定义动态表格-格式
    const columns = reactive([
      { label: '用户ID', prop: 'userId'},
      { label: '用户名', prop: 'userName' },
      { label: '用户邮箱', prop: 'userEmail' },
      { label: '用户角色', prop: 'role' },
      { label: '用户状态', prop: 'state' },
      { label: '注册时间', prop: 'createTime' },
      { label: '最后登录', prop: 'lastLoginTime' },
    ])
    return { user, userList, columns }
  }
}
</script>
          