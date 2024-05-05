<template>
  <div class="dept-manager">
    <div class="query-form">
      <el-form :inline="true" :model="queryForm" ref="queryFormRef">
        <el-form-item prop="deptName" label="部门名称">
          <el-input v-model="queryForm.deptName" placeholder="请输入部门名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="getDeptList" type="primary">查询</el-button>
          <el-button @click="handleReset('queryFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button @click="handleAdd" type="primary">创建</el-button>
      </div>
      <el-table :data="deptList" row-key="_id">
        <el-table-column v-for="item in columns" v-bind="item"/>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" @click="handleDel(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      v-model="dialogVisible"
      :title="action == 'add' ? '创建部门' : '编辑部门'"
      width="500"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleReset('dialogFormRef')"
    >
    <el-form :model="dialogForm" ref="dialogFormRef" :rules="rules" label-width="100px">
      <el-form-item label="上级部门" prop="parentId">
        <el-cascader 
          :options="deptList"
          v-model="dialogForm.parentId" 
          :props="{checkStrictly: true, label: 'deptName', value: '_id'}" 
          clearable 
        />
      </el-form-item>  
      <el-form-item label="部门名称" prop="deptName">
        <el-input placeholder="请输入部门名称" v-model="dialogForm.deptName"></el-input>
      </el-form-item>
      <el-form-item label="负责人" prop="user">
        <el-select placeholder="请选择部门负责人" v-model="dialogForm.user" @change="handleUser">
          <el-option
            v-for="item in userList"
            :key="item.userId"
            :label="item.userName"
            :value="`${item.userId}/${item.userName}/${item.userEmail}`"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人邮箱" prop="userEmail">
        <el-input disabled placeholder="请输入负责人邮箱" v-model="dialogForm.userEmail"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<script>
import utils from "@/utils/utils";
export default {
  name: 'Dept',
  data() {
    return {
      queryForm: {
        deptName: ""
      },
      columns:[
        {
          label: '部门名称',
          prop: 'deptName'
        },
        {
          label: '负责人',
          prop: 'userName'
        },
        {
          label: '更新时间',
          prop: 'updateTime',
          formatter:(row, col, val) => {
            return utils.formatDate(new Date(val));
          }
        },
        {
          label: '创建时间',
          prop: 'createTime',
          formatter:(row, col, val) => {
            return utils.formatDate(new Date(val));
          }
        },
      ],
      deptList: [],
      userList: [],
      pager: {
        pageNum: 1,
        pageSize: 10
      },
      dialogVisible: false,
      action: "",
      dialogForm: [],
      user: {
        userId: "",
        userName: "",
        userEmail: ""
      },
      rules: {
        parentId: [
          { required: true, message:'请选择上级部门', trigger: 'blur'}
        ],
        deptName: [
          { required: true, message:'请输入部门名称', trigger: 'blur'}
        ],
        user: [
          { required: true, message:'请选择部门负责人', trigger: 'blur'}
        ]
      }
    }
  },
  mounted() {
    this.getDeptList();
    this.getAllUserList();
  },
  methods: {
    async getDeptList() {
      const list = await this.$api.getDeptList({...this.queryForm, ...this.pager});
      this.deptList = list;
    },
    async getAllUserList() {
      this.userList = await this.$api.getAllUserList();
    },
    handleUser(val) {
      const [userId, userName, userEmail] = val.split('/');
      Object.assign(this.dialogForm, {userId, userName, userEmail});
    },
    handleReset(form) {
      console.log('close');
      this.$refs[form].resetFields();
    },
    // handleClose() {
    //   this.dialogVisible = false;
    //   console.log('close');
    //   this.handleReset('dialogFormRef');
    // },
    handleAdd() {
      this.dialogVisible = true;
      this.action = "add";
    },
    handleEdit(row) {
      this.action = "edit";
      this.dialogVisible = true;
      this.$nextTick(()=> {
        Object.assign(this.dialogForm, row, {
          user: `${row.userId}/${row.userName}/${row.userEmail}`
        });
      })
    },
    async handleDel(id) {
      this.action = "delete";
      await this.$api.deptSubmit({_id: id, action: this.action});
      this.$message.success('删除成功');
      this.getDeptList();
  
    },
    handleSubmit() {
      this.$refs['dialogFormRef'].validate(async (valid) => {
        if (valid) {
          let params = {...this.dialogForm, action: this.action};
          delete params.user;
          let res = await this.$api.deptSubmit(params);
          if(res) {
            this.$message.success('操作成功');
            this.dialogVisible = false;
            this.getDeptList();
          }
        }
      })
    }
  }
}
</script>