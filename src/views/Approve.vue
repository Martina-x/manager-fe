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
          <el-button type="primary" @click="getApplyList">查询</el-button>
          <el-button @click="resetForm('queryFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <el-table :data="applyList">
        <el-table-column type="selection" width="35" />
        <el-table-column v-for="item in columns" :prop="item.prop" :label="item.label" :width="item.width"
          :formatter="item.formatter" />
        <el-table-column fixed="right" label="操作" width="155">
          <template #default="scope">
            <el-button size="small" @click="handleDetail(scope.row)"
              v-if="scope.row.curAuditUserName == userInfo.userName && [1, 2].includes(scope.row.applyState)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="->, prev, pager, next" :total="parseInt(pager.total)"
          :page-size="pager.pageSize" @current-change="handleCurrentChange" />
      </div>
    </div>
    <el-dialog v-model="showDetailModal" title="申请休假详情" :close-on-click-modal="false" :close-on-press-escape=false
      destroy-on-close>
      <el-steps style="max-width: 600px" :space="200" :active="detail.applyState > 2 ? 3 : detail.applyState"
        align-center>
        <el-step title="待审批" />
        <el-step title="审批中" />
        <el-step title="审批通过/拒绝" />
      </el-steps>
      <el-form :model="dialogForm" ref="dialogFormRef" label-width="120px" label-suffix=":" :rules="rules">
        <el-form-item label="申请人">
          <div>{{ detail.applyUser.userName }}</div>
        </el-form-item>
        <el-form-item label="休假类型">
          <div>{{ detail.applyTypeName }}</div>
        </el-form-item>
        <el-form-item label="休假时间">
          <div>{{ detail.time }}</div>
        </el-form-item>
        <el-form-item label="休假时长">
          <div>{{ detail.leaveTime }}</div>
        </el-form-item>
        <el-form-item label="休假原因">
          <div>{{ detail.reasons }}</div>
        </el-form-item>
        <el-form-item label="审批状态">
          <div>{{ detail.applyStateName }}</div>
        </el-form-item>
        <el-form-item label="审批人">
          <div>{{ detail.curAuditUserName }}</div>
        </el-form-item>
        <el-form-item label="备注" prop="remark" required>
          <el-input v-model="dialogForm.remark" type="textarea" :row="3" placeholder="请输入审批备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleApprove('pass')">审核通过</el-button>
          <el-button type="danger" @click="handleApprove('refuse')">驳回</el-button>
        </div>
      </template>
    </el-dialog>
  </div>

</template>

<script>
import { reactive, ref, onMounted, getCurrentInstance } from 'vue';
import utils from '@/utils/utils';
export default {
  name: 'Approve',
  setup() {
    // 获取Composition API上下文对象
    const instance = getCurrentInstance();
    const { proxy, ctx } = instance;

    // 初始化用户表单对象
    const queryForm = reactive({
      applyState: 1
    });
    // 初始化详情表单
    const dialogForm = reactive({
      remark: ""
    });
    // 初始化申请列表
    const applyList = ref([]);
    // 创建休假申请详情表单
    let detail = ref({});
    const userInfo = proxy.$store.state.userInfo;
    const rules = {
      remark: [
        { required: true, message: '请输入审核备注', triggle: 'change' }
      ]
    }
    const showDetailModal = ref(false);
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
        label: '申请人',
        prop: 'applyUser',
        formatter: (row) => {
          return row.applyUser.userName;
        }
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
          return utils.formatDate(new Date(row.createTime));
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
      const params = { ...pager, ...queryForm, type: "approve" };
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

    // 查看申请详情
    const handleDetail = (row) => {
      let data = {...row};
      data.applyTypeName = {
        1: '事假',
        2: '调休',
        3: '年假'
      }[data.applyType];
      data.time = utils.formatDate(new Date(data.startTime), "yyyy-MM-dd") + '到' + utils.formatDate(new Date(data.endTime), "yyyy-MM-dd");
      data.applyStateName = {
        1: "待审批",
        2: "审批中",
        3: "审批拒绝",
        4: "审批通过",
        5: "作废"
      }[data.applyState]
      detail.value = data;
      showDetailModal.value = true;
    }

    // 审核
    const handleApprove = async (action) => {
      proxy.$refs.dialogFormRef.validate(async valid => {
        if (valid) {
          let params = {
            _id: detail.value._id,
            remark: dialogForm.remark,
            action: action
          }
          try {
            const res = await proxy.$api.handleApprove(params);
            proxy.$message.success("操作成功");
            handleClose();
            getApplyList();
            proxy.$store.commit('saveNoticeCount', proxy.$store.state.noticeCount - 1);
          } catch (error) {

          }
        }
      })

    }

    // 关闭弹框
    const handleClose = () => {
      showDetailModal.value = false;
      resetForm('dialogFormRef');
    }

    return {
      queryForm,
      dialogForm,
      applyList,
      columns,
      detail,
      userInfo,
      rules,
      resetForm,
      pager,
      handleCurrentChange,
      showDetailModal,
      getApplyList,
      handleDetail,
      handleApprove
    }
  }
}
</script>
