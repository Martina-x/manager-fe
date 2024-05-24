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
            <el-button type="primary" size="small" @click="handlePermissionOpen(scope.row)">设置权限</el-button>
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
    <el-dialog v-model="showPermissionModal" title="权限设置" :close-on-click-modal="false" :close-on-press-escape=false>
      <el-form label-width="100px">
        <el-form-item label="角色名称">{{ curRoleName }}</el-form-item>
        <el-form-item label="选择权限">
          <el-tree ref="treeRef" style="max-width: 600px" :data="menuList" show-checkbox node-key="_id"
            :props="{ label: 'menuName' }" :default-expand-all="true" :default-checked-keys="curCheckedList" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPermissionModal = false">取 消</el-button>
          <el-button type="primary" @click="handlePerssionSubmit">确 定</el-button>
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
          prop: 'permissionList',
          width: 200,
          formatter: (row, col, val) => {
            let list = val.halfCheckedKeys || [];
            // let names = list.map(key => {
            //   if (key) return this.actionMap[key];
            // });
            let names = [];
            list.map(key => {
              const name = this.actionMap[key]
              if (key && name) {
                names.push(name);
              } 
            });
            return names.join(', ');
          }
        },
        {
          label: '创建时间',
          prop: 'createTime',
          formatter: (row, col, val) => {
            return utils.formatDate(new Date(val))
          }
        },
        {
          label: '更新时间',
          prop: 'updateTime',
          formatter: (row, col, val) => {
            return utils.formatDate(new Date(val))
          }
        }
      ],
      pager: {
        pageSize: 10,
        pageNum: 1
      },
      showModal: false,
      dialogForm: {},
      rules: {
        roleName: { required: true, message: '请输入角色名称', trigger: 'blur' }
      },
      action: '',
      showPermissionModal: false,
      menuList: [],
      curRoleId: '',
      curRoleName: '',
      curCheckedList: [],
      actionMap: {}
    }
  },
  mounted() {
    this.getRoleList();
    this.getMenuList();
  },
  methods: {
    // 角色列表初始化
    async getRoleList() {
      try {
        let { list, page } = await this.$api.getRoleList({ ...this.queryForm, ...this.pager });
        this.roleList = list;
        this.pager.total = page.total
      } catch (error) {
        throw new Error(error);
      }
    },

    // 菜单列表初始化
    async getMenuList() {
      try {
        const list = await this.$api.getMenuList();
        this.menuList = list;
        this.getActionMap(list); // 获取菜单名称映射
      } catch (error) {
        console.error(error);
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
      this.action = 'edit';
      this.$nextTick(() => {
        Object.assign(this.dialogForm, { _id: row._id, roleName: row.roleName, remark: row.remark });
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
    },

    // 设置权限
    handlePermissionOpen(row) {
      this.showPermissionModal = true;
      this.curRoleId = row._id
      this.curRoleName = row.roleName;
      let { checkedKeys } = row.permissionList;
      setTimeout(() => {
        this.$refs.treeRef.setCheckedKeys(checkedKeys);
      });

    },

    // 提交权限
    async handlePerssionSubmit() {
      // 获取选中节点
      let nodes = this.$refs.treeRef.getCheckedNodes();
      // 获取半选中节点id
      let halfKeys = this.$refs.treeRef.getHalfCheckedKeys();
      let checkedKeys = []; // 过滤后的选中节点id
      let parentKeys = []; // 过滤出来的父菜单节点id
      // 将选中结点中的父菜单项过滤出来，区分菜单和按钮
      nodes.map(node => {
        if (!node.children) {
          checkedKeys.push(node._id);
        } else {
          parentKeys.push(node._id);
        }
      });
      let params = {
        _id: this.curRoleId,
        permissionList: {
          checkedKeys,
          halfCheckedKeys: parentKeys.concat(halfKeys)
        }
      };
      await this.$api.updatePermission(params);
      this.showPermissionModal = false;
      this.$message.success('设置成功');
      this.getRoleList();
    },

    getActionMap(list) {
      let actionMap = {};
      const deep = (arr) => {
        while (arr.length) {
          const item = arr.pop();
          if (item.children && item.action) {    // 子菜单均为操作按钮
            actionMap[item._id] = item.menuName;
          }
          if (item.children && !item.action) {   // 还没有到最后一级，递归
            deep(item.children);
          }
        }
      }
      deep(JSON.parse(JSON.stringify(list)));
      this.actionMap = actionMap;
    },

    handleCurrentChange(current) {
      this.pager.pageNum = current;
      this.getRoleList();
    },
  }
}
</script>