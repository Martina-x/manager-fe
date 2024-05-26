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
        <el-button type="primary" @click="handleCreate">申请休假</el-button>
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
    <el-dialog v-model="showModel" title="申请休假" :close-on-click-modal="false" :close-on-press-escape=false
      @close="resetForm('dialogFormRef')">
      <el-form :model="dialogForm" label-width="120px" :rules="rules" ref="dialogFormRef">
        <el-form-item prop="applyType" label="休假类型" required>
          <el-select v-model="dialogForm.applyType" style="width: 140px">
            <el-option label="事假" :value="1" />
            <el-option label="调休" :value="2" />
            <el-option label="年假" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="休假时间" required>
          <el-row>
            <el-col :span="10">
              <el-form-item prop="startTime">
                <el-date-picker v-model="dialogForm.startTime" type="datetime" placeholder="选择开始日期" @change="(val) => handleDateChange('startTime', val)"/>
              </el-form-item>
            </el-col>
            <el-col :span="2" style="text-align:center">-</el-col>
            <el-col :span="10">
              <el-form-item prop="endTime">
                <el-date-picker v-model="dialogForm.endTime" type="datetime" placeholder="选择结束日期" @change="(val) => handleDateChange('endTime', val)"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="休假时长" prop="leaveTime" required>
          {{ dialogForm.leaveTime }}
        </el-form-item>
        <el-form-item label="休假原因" prop="reasons">
          <el-input v-model="dialogForm.reasons" type="textarea" :rows="3" placeholder="请输入休假原因" />
        </el-form-item>
      </el-form> 
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showModel=false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
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
    // 创建休假弹框表单
    const dialogForm = reactive({
      applyType: 1,
      startTime: "",
      endTime: "",
      leaveTime: "0天",
      reasons: ""
    });
    const rules = {
      startTime: [
        { type: "date", required: true, message: '请选择开始日期', triggle: 'change' }
      ],
      endTime: [
        { type: "date", required: true, message: '请选择结束日期', triggle: 'blur' }
      ],
      reasons: [
        { required: true, message: '请输入请假原因', triggle: 'blur' }
      ]
    }
    const action = ref("create");
    const showModel = ref(false);
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

    // 关闭弹框
    const handleClose = () => {
      showModel.value = false;
      resetForm('dialogFormRef');
      
    }

    // 点击申请休假-展示弹框
    const handleCreate = () => {
      showModel.value = true;
      action.value = "create";
    }

    // 获取休假时长
    const handleDateChange = (key, val) => {
      const { startTime, endTime } = dialogForm;
      if(!startTime || !endTime) return;
      if(startTime > endTime) {
        proxy.$message.error("开始时间不能晚于结束时间");
        setTimeout(() => {
          dialogForm[key] = "0天";
        }, 0)
        return;
      } else {
        dialogForm.leaveTime = Math.round((endTime - startTime) / ( 24 * 60 * 60 * 1000) + 1) + '天'
      }
      

    }
    // 提交弹框表单
    const handleSubmit = () => {
      proxy.$refs.dialogFormRef.validate(async (valid) => {
        if (valid) {
          let params = {...dialogForm, action: action.value};
          const res = await proxy.$api.applySubmit(params);
          proxy.$message.success("创建成功");
          handleClose();
          getApplyList();
        }
      })
    }

    return {
      queryForm,
      applyList,
      columns,
      rules,
      resetForm,
      pager,
      showModel,
      handleCurrentChange,
      dialogForm,
      handleCreate,
      handleSubmit,
      handleDateChange
    }
  }
}
</script>
