<template>
  <div class="user-manager">
    <div class="query-form">
      <el-form :inline="true" :model="queryForm" ref="queryFormRef">
        <el-form-item label="审批状态" prop="applyState">
          <el-select v-model="queryForm.applyState" style="width: 140px">
            <el-option label="全部" :value="0" />
            <el-option label="待审批" :value="1" />
            <el-option label="审批中" :value="2" />
            <el-option label="审批拒绝" :value="3" />
            <el-option label="审批通过" :value="4" />
            <el-option label="作废" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button @click="resetForm('queryFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary">申请休假</el-button>
      </div>
      <el-table :data="applyList">
        <el-table-column type="selection" width="35" />
        <el-table-column v-for="item in columns" :prop="item.prop" :label="item.label" :width="item.width"
          :formatter="item.formatter" />
        <el-table-column fixed="right" label="操作" width="155">
          <template #default="scope">
            <el-button size="small">查看</el-button>
            <el-button type="danger" size="small">作废</el-button>
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
import utils from '@/utils/utils';
export default {
  name: 'Leave',
  setup() {
    // 获取Composition API上下文对象
    const instance = getCurrentInstance();
    const { proxy, ctx } = instance;
    // 初始化用户表单对象
    const queryForm = reactive({
      applyState: 1
    });
    // 初始化申请列表
    const applyList = ref([]);
    // 初始化分页对象
    const pager = reactive({
      pageNum: 1,
      pageSize: 10,
      total: 0
    });
    // 定义动态表格-格式
    const columns = reactive([
      {
        label: '单号',
        prop: 'orderNo'
      },
      {
        label: '休假时间',
        prop: '', // 不需要取
        formatter: (row, col, val) => {
          return utils.formatDate(new Date(row.startTime), "yyyy-MM-dd") + '到' + utils.formatDate(new Date(row.endTime), "yyyy-MM-dd");
        }
      },
      {
        label: '休假时长',
        prop: 'leaveTime'
      },
      {
        label: '休假类型',
        prop: 'applyType',
        formatter: (row, col, val) => {
          return {
            1: '事假',
            2: '调休',
            3: '年假'
          }[val];
        }
      },
      {
        label: '休假原因',
        prop: 'reasons'
      },
      {
        label: '申请时间',
        prop: 'createTime',
        formatter: (row, col, val) => {
          return utils.formatDate(new Date(row.createTime), "yyyy-MM-dd");
        }
      },
      {
        label: '审批人',
        prop: 'auditUsers'
      },
      {
        label: '当前审批人',
        prop: 'curAuditUserName'
      },
      {
        label: '审批状态',
        prop: 'applyState',
        formatter: (row, col, val) => {
          return {
            1: '待审批',
            2: '审批中',
            3: '审批拒绝',
            4: '审批通过',
            5: '作废'
          }[val];
        }
      },
    ])

    // 初始化接口调用
    onMounted(() => {
      getApplyList();
    })

    // 获取申请列表
    const getApplyList = async () => {
      const params = { ...pager, ...queryForm };
      try {
        const { page, list } = await proxy.$api.getApplyList(params);
        applyList.value = list;
        pager.total = page.total;
      } catch (err) {
        console.log(err);
      }
    }
 
    // 重置查询表单
    const resetForm = (form) => {
      proxy.$refs[form].resetFields();
    }

    // 分页数据处理
    const handleCurrentChange = (current) => {
      pager.pageNum = current;
      getApplyList();
    }
    return {
      queryForm,
      applyList,
      columns,
      resetForm,
      pager,
      handleCurrentChange
    }
  }
}
</script>