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
        <el-button type="primary" @click="handleCreate">新增</el-button>
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
    <el-dialog v-model="showModal" title="新增用户">
      <el-form :model="dialogForm" label-width="100px" :rules="rules" ref="dialogFormRef">
        <el-form-item prop="userName" label="用户名">
          <el-input v-model="dialogForm.userName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="dialogForm.userEmail" placeholder="请输入用户邮箱">
            <template #append>.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="dialogForm.mobile" placeholder="请输入用户手机号" />
        </el-form-item>
        <el-form-item label="岗位" prop="job">
          <el-input v-model="dialogForm.job" placeholder="请输入用户岗位" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="dialogForm.state" style="width: 140px">
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="2" />
            <el-option label="试用期" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统角色" prop="roleList">
          <el-select v-model="dialogForm.roleList" style="width: 140px" placeholder="请选择用户系统角色">
            <el-option></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader 
            v-model="dialogForm.deptId" 
            :options="[
              {
                _id: 1,
                deptName: 'ssss',
                children: [
                  {
                    _id: 1,
                    deptName: 'ssss'}
                ]
              }
            ]" 
            :props="{
              checkStrictly: true,
              value: '_id',
              label: 'deptName'
            }" clearable placeholder="请选择部门" style="width: 140px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button>取消</el-button>
          <el-button type="primary">确定</el-button>
        </div>
      </template>
    </el-dialog>
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
      state: 3
    });
    // 初始化用户列表数据
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
    // 初始化选中列表
    let checkedUserIds = ref([]);
    // 弹框显示对象
    let showModal = ref(false);
    // 新增用户form对象
    const dialogForm = reactive({
      state: 3
    })
    // 定义表单校验规则
    const rules = {
      userName: [
        { required: true, message:'请输入用户名称', trigger: 'blur'}
      ],
      userEmail: [
        { required: true, message: '请输入用户邮箱', trigger: 'blur' }
      ],
      mobile: [
        {
          validator(rule, value, callback) {
            const reg = /^1\d{10}$/
            if (!value) {
              callback();
            } else if (!reg.test(value)) {
              callback('请输入正确格式的手机号')
            } else {
              callback();
            }
          }, 
          trigger: 'blur' 
        }
      ],
      deptId: [
        { required: true, message: '请输入用户所属部门', trigger: 'blur' },
        {validator(value){console.log(value)}, trigger: 'blur'}
      ]
    };
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
    // 用户新增
    const handleCreate = () => {
      showModal.value = true;
    }
    return { 
      user, 
      userList, 
      columns, 
      pager,
      showModal,
      dialogForm,
      rules,
      getUserList, 
      resetForm, 
      handleQuery,
      handleCurrentChange,
      handleDel,
      handleSelectionChange,
      handlePatchDel,
      handleCreate
    }
  }
}
</script>
          