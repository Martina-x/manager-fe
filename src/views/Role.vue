<template>
  <div class="role-manager">
    <div class="query-form">
      <el-form :inline="true" :model="queryForm" ref="queryFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRoleList">查询</el-button>
          <el-button @click="handleReset('queryFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd()">创建</el-button>
      </div>
      <el-table :data="roleList">
        <el-table-column v-for="item in columns" :prop="item.prop" :label="item.label" :width="item.width"
          :formatter="item.formatter" />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button size="small">编辑</el-button>
            <el-button type="primary" size="small">设置权限</el-button>
            <el-button type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="->, prev, pager, next" :total="parseInt(pager.total)"
          :page-size="pager.pageSize" @current-change="handleCurrentChange" />
      </div>
    </div>
    <!-- <el-dialog v-model="showModal" title="创建菜单" :close-on-click-modal="false" :close-on-press-escape=false
      @close="handleClose">
      <el-form :model="dialogForm" label-width="100px" :rules="rules" ref="dialogFormRef">
        <el-form-item label="父级菜单" prop="parentId">
          <el-cascader v-model="dialogForm.parentId" :options="roleList"
            :props="{ checkStrictly: true, value: '_id', label: 'menuName' }" clearable placeholder="请选择父级菜单"
            style="margin-right: 15px;" />
          <span>不选，则直接创建一级菜单</span>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="dialogForm.menuType">
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="dialogForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="权限标识" prop="menuCode" v-show="dialogForm.menuType == 2">
          <el-input v-model="dialogForm.menuCode" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" v-show="dialogForm.menuType == 1">
          <el-input v-model="dialogForm.icon" placeholder="请输入菜单图标" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path" v-show="dialogForm.menuType == 1">
          <el-input v-model="dialogForm.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-show="dialogForm.menuType == 1">
          <el-input v-model="dialogForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState">
          <el-radio-group v-model="dialogForm.menuState">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">停用</el-radio>
          </el-radio-group>
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
  name: 'Role',
  data() {
    return {
      queryForm: {},
      roleList: [],
      columns: [
        {
          label: '角色名称',
          prop: 'roleName',
          width: 150
        },
        {
          label: '备注',
          prop: 'remark'
        },
        {
          label: '权限列表',
          prop: 'permissionList'
        },
        {
          label: '创建时间',
          prop: 'createTime',
          formatter: (row, col, val) => {
            return utils.formatDate(new Date(val))
          }
        },
      ],
      pager: {
        pageSize: 10
      },
    }
  },
  mounted() {
    this.getRoleList();
  },
  methods: {
    // 菜单列表初始化
    async getRoleList() {
      try {
        let { list, page } = await this.$api.getRoleList(this.queryForm);
        this.roleList = list;
        this.pager.total = page.total
      } catch (error) {
        throw new Error(error);
      }
    },

    // 表单重置
    handleReset(form) {
      this.$refs[form].resetFields();
    }
  }
}
</script>