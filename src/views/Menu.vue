<template>
  <div class="menu-manager">
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
          <el-button type="primary" @click="getMenuList">查询</el-button>
          <el-button @click="handleReset('queryFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd(1)">创建</el-button>
      </div>
      <el-table :data="menuList" row-key="_id">
        <el-table-column v-for="item in columns" :prop="item.prop" :label="item.label" :width="item.width"
          :formatter="item.formatter" />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" @click="handleAdd(2, scope.row)">新增</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDel(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="showModal" title="创建菜单" :close-on-click-modal="false" :close-on-press-escape=false
      @close="handleClose">
      <el-form :model="dialogForm" label-width="100px" :rules="rules" ref="dialogFormRef">
        <el-form-item label="父级菜单" prop="parentId">
          <el-cascader v-model="dialogForm.parentId" :options="menuList"
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
    </el-dialog>
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
      ],
      showModal: false,
      dialogForm: {
        parentId: [null],
        menuType: 1,
        menuState: 1
      },
      rules: {
        menuName: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在2到8个字符', trigger: 'blur' }
        ]
      },
      action: ''
    }
  },
  mounted() {
    this.getMenuList();
  },
  methods: {
    // 菜单列表初始化
    async getMenuList() {
      try {
        let list = await this.$api.getMenuList(this.queryForm);
        this.menuList = list;
      } catch (error) {
        throw new Error(error);
      }
    },

    // 表单重置
    handleReset(form) {
      this.$refs[form].resetFields();
    },

    // 新增菜单
    handleAdd(type, row) {
      this.showModal = true;
      this.action = 'create';
      if (type == 2) {
        this.dialogForm.parentId = [...row.parentId, row._id].filter(item => {
          return item
        })
      }
    },

    // 编辑菜单
    handleEdit(row) {
      this.action = 'edit';
      this.showModal = true;
      this.$nextTick(() => {
        Object.assign(this.dialogForm, row);
      })
    },

    // 删除菜单
    async handleDel(_id) {
      await this.$api.menuSubmit({ _id, action: 'delete' });
      this.$message.success('删除成功');
      this.getMenuList();
    },

    // 弹框关闭
    handleClose() {
      this.showModal = false;
      this.handleReset('dialogFormRef');
    },

    // 菜单操作-提交
    handleSubmit() {
      this.$refs['dialogFormRef'].validate(async (valid) => {
        if (valid) {
          let { action, dialogForm } = this;
          let params = { ...dialogForm, action };
          let res = await this.$api.menuSubmit(params);
          this.$message.success('操作成功');
          this.handleClose();
          this.getMenuList();
        }
      })
    }
  }
}
</script>