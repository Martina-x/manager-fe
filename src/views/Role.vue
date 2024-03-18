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
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="primary" size="small">设置权限</el-button>
            <el-button type="danger" size="small" @click="handleDel(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="->, prev, pager, next" :total="parseInt(pager.total)"
          :page-size="pager.pageSize" @current-change="handleCurrentChange" />
      </div>
    </div>
    <el-dialog v-model="showModal" title="创建角色" :close-on-click-modal="false" :close-on-press-escape=false
      @close="handleClose">
      <el-form :model="dialogForm" label-width="100px" :rules="rules" ref="dialogFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="dialogForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="2" v-model="dialogForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
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
      showModal: false,
      dialogForm: {},
      rules: {
        roleName: { required: true, message: '请输入角色名称', trigger: 'blur' }
      },
      action: ''
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
    },

    // 角色创建
    handleAdd() {
      this.showModal = true;
      this.action = 'create';
    },

    // 角色编辑
    handleEdit(row) {
      this.showModal = true;
      this.action = 'edit ';
      this.$nextTick(() => {
        Object.assign(this.dialogForm, row)
      })
    },

    // 角色删除
    async handleDel(_id) {
      await this.$api.roleSubmit({ action: 'delete', _id });
      this.$message.success('删除成功');
      this.handleClose();
      this.getRoleList();
    },

    // 弹框关闭
    handleClose() {
      this.showModal = false;
      this.handleReset('dialogFormRef')
    },

    // 角色提交
    handleSubmit() {
      this.$refs['dialogFormRef'].validate(async (valid) => {
        if (valid) {
          let { dialogForm, action } = this;
          const res = await this.$api.roleSubmit({ action, ...dialogForm });
        } else {
          return false
        }
        this.$message.success('操作成功');
        this.handleClose();
        this.getRoleList();
      })

    }
  }
}
</script>