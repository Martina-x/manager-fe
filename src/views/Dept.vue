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
        <el-button type="primary">创建</el-button>
      </div>
      <el-table :data="deptList" row-key="_id">
        <el-table-column v-for="item in columns" v-bind="item"/>
        <el-table-column label="操作">
          <template #default>
            <el-button>编辑</el-button>
            <el-button type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
      }
      columns:[
        {
          label: '部门名称',
          prop: 'deptName'
        },
        {
          label: '负责人',
          prop: 'userId'
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
      pager: {
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  mounted() {
    this.getDeptList();
  }
  methods: {
    async getDeptList() {
      const list = await this.$api.getDeptList(...this.queryForm, ...this.pager);
      this.deptList = list;
    }
    handleReset(form) {
      this.$refs[form].resetFields();
    }
  }
}
</script>