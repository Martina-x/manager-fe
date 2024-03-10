<template>
  <div class="user-manager">
    <div class="query-form">
      <el-form :inline="true" :model="user" ref="userForm">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="user.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="user.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="用户状态" prop="state">
          <el-select v-model="user.state" placeholder="请选择用户状态" style="width: 140px">
            <el-option label="所有" :value="0" />
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="2" />
            <el-option label="试用期" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary">新增</el-button>
        <el-button type="danger" @click="handlePatchDel">批量删除</el-button>
      </div>
      <el-table :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="35" />
        <el-table-column v-for="item in columns" :prop="item.prop" :label="item.label" :width="item.width"
          :formatter="item.formatter" />
        <el-table-column fixed="right" label="操作" width="155">
          <template #default="scope">
            <el-button size="small">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="->, prev, pager, next" :total="parseInt(pager.total)"
          :page-size="pager.pageSize" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>

</template>
          
<script>
import { reactive, ref, onMounted, getCurrentInstance } from 'vue';

export default {
  name: 'User',
  setup() {
    // 获取Composition API上下文对象
    const instance = getCurrentInstance();
    const { proxy, ctx } = instance;
    // 初始化用户表单对象
    const user = reactive({
      state: 0
    });
    // 初始话用户列表数据
    const userList = ref([]);
    // 初始化分页对象
    const pager = reactive({
      pageNum: 1,
      pageSize: 10
    });
    // 定义动态表格-格式
    const columns = reactive([
      { 
        label: '用户ID', 
        prop: 'userId'
      },
      { 
        label: '用户名', 
        prop: 'userName' 
      },
      { 
        label: '用户邮箱', 
        prop: 'userEmail' 
      },
      { 
        label: '用户角色', 
        prop: 'role',
        formatter: (row, col, val) => {
          return { 
            0: '管理员', 
            1: '普通用户' 
          }[val];
        } 
      },
      { 
        label: '用户状态', 
        prop: 'state', 
        formatter: (row, col, val) => {
          return { 
            1: '在职', 
            2: '离职', 
            3: '试用期' 
          }[val];
        } 
      },
      { 
        label: '注册时间', prop: 'createTime' },
      { 
        label: '最后登录', prop: 'lastLoginTime' },
    ])
    // 初始话选中列表
    let checkedUserIds = ref([]);
    // 初始化接口调用
    onMounted(() => {
      getUserList();
    })
    // 获取用户列表
    const getUserList = async() => {
      const params = { ...pager, ...user };
      try {
        const { page, list } = await proxy.$api.getUserList(params);
        userList.value = list;
        pager.total = page.total;
      } catch (err) {
        console.log(err);
      }
    }
    // 查询事件，获取用户列表
    const handleQuery = () => {
      getUserList();
    }
    // 重置查询表单
    const resetForm = () => {
      proxy.$refs["userForm"].resetFields();
    }
    // 分页数据处理
    const handleCurrentChange = (current) => {
      pager.pageNum = current;
      getUserList();
    }
    // 用户单个删除
    const handleDel = async (row) => {
      try {
        const res = await proxy.$api.userDel({userIds: [row.userId]});
        if (res.nModified > 0) {
          proxy.$message.success('删除成功');
          getUserList();
        }else {
          proxy.$message.error('删除失败');
        }
      } catch (error) {
        console.error(error);
      }
    }
    // 多选事件
    const handleSelectionChange = (list) => {
      let arr = [];
      list.map(item => {
        arr.push(item.userId);
      });
      checkedUserIds.value = arr;
    }
    // 批量删除
    const handlePatchDel = async () => {
      try {
        if (checkedUserIds.value.length == 0) {
          proxy.$message.error('请选择要删除的用户');
          return;
        }
        const res = await proxy.$api.userDel({ userIds: checkedUserIds.value });
        if (res.nModified > 0) {
          proxy.$message.success('删除成功');
          getUserList();
        } else {
          proxy.$message.error('删除失败');
        }
      } catch (error) {
        console.error(error);
      }
    }
    return { 
      user, 
      userList, 
      columns, 
      pager,
      getUserList, 
      resetForm, 
      handleQuery,
      handleCurrentChange,
      handleDel,
      handleSelectionChange,
      handlePatchDel
    }
  }
}
</script>
          