<template>
  <div class="user-manager">
    <div class="query-form">
      <el-form :inline="true" :model="queryForm" ref="queryFormRef">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="queryForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState">
          <el-select v-model="queryForm.menuState" style="width: 140px">
            <el-option label="正常" :value="1" />
            <el-option label="废除" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset('queryFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary">创建</el-button>
      </div>
      <el-table :data="menuList" row-key="_id">
        <el-table-column v-for="item in columns" :prop="item.prop" :label="item.label" :width="item.width"
          :formatter="item.formatter" />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" @click=handleAdd(scope.row)>新增</el-button>
            <el-button size="small" @click=handleEdit(scope.row)>编辑</el-button>
            <el-button type="danger" size="small" @click=handleDel(scope.row)>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- <el-dialog v-model="showModal" title="新增用户" :close-on-click-modal="false" :close-on-press-escape=false
      @close="handleClose">
      <el-form :model="dialogForm" label-width="100px" :rules="rules" ref="dialogFormRef">
        <el-form-item prop="userName" label="用户名">
          <el-input v-model="dialogForm.userName" :disabled="action == 'edit'" />
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="dialogForm.userEmail" placeholder="请输入用户邮箱" :disabled="action == 'edit'">
            <template #append>@immoc.com</template>
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
          <el-select v-model="dialogForm.roleList" style="width: 100%" placeholder="请选择用户系统角色" multiple>
            <el-option v-for="role in roleList" :key="role._id" :label="role.roleName" :value="role._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader v-model="dialogForm.deptId" :options="deptList"
            :props="{ checkStrictly: true, value: '_id', label: 'deptName' }" clearable placeholder="请选择所属部门"
            style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog> -->
  </div>

</template>

<script>
import utils from '@/utils/utils'
export default {
  name: 'Menu',
  data() {
    return {
      queryForm: {
        menuState: 1
      },
      menuList: [],
      columns: [
        {
          label: '菜单名称',
          prop: 'menuName',
          width: 150
        },
        {
          label: '图标',
          prop: 'icon'
        },
        {
          label: '菜单类型',
          prop: 'menuType',
          formatter: (row, col, val) => {
            return {
              1: '菜单',
              2: '按钮'
            }[val]
          }
        },
        {
          label: '权限标识',
          prop: 'menuCode'
        },
        {
          label: '路由地址',
          prop: 'path'
        },
        {
          label: '组件路径',
          prop: 'component'
        },
        {
          label: '菜单状态',
          prop: 'menuState',
          width: 90,
          formatter: (row, col, val) => {
            return {
              1: '正常',
              2: '停用'
            }[val]
          }
        },
        {
          label: '创建时间',
          prop: 'createTime',
          formatter: (row, col, val) => {
            return utils.formatDate(new Date(val))
          }
        },
      ]
    }
  },
  mounted() {
    this.getMenuList();
  },
  methods: {
    handleQuery() {

    },

    handleReset(ref) {

    },

    async getMenuList() {
      try {
        let list = await this.$api.getMenuList(this.queryForm);
        this.menuList = list;
      } catch (error) {
        throw new Error(error);
      }
      
    },

    handleAdd(row) {

    },

    handleEdit(row) {

    },

    handleDel(row) {

    }
  }
}
</script>