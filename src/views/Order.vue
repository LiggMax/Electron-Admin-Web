<script setup>
import {ref, reactive, onMounted} from 'vue'
import {getOrderList, orderSettlementService} from '../api/order.js'
import Message from '../utils/message.js'
import DateFormatter from '../utils/DateFormatter.js'
import {ElMessageBox} from 'element-plus'

// 订单数据
const tableData = ref([])
const tableLoading = ref(false)


// 查询条件
const queryForm = reactive({
  orderId: '',
  phoneNumber: '',
  status: '',
  userId: '',
  startDate: '',
  endDate: '',
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [5, 10, 20, 50]
})

// 获取订单列表
const fetchOrders = async () => {
  tableLoading.value = true
  try {
    const res = await getOrderList()
    tableData.value = res.data
    pagination.total = res.data.length
  } finally {
    tableLoading.value = false
  }
}

// 格式化订单状态
const formatOrderStatus = (row) => {
  if (row.state === 0) {
    return '未使用'
  } else if (row.state === 1) {
    return '已使用'
  } else if (row.state === 2) {
    return '已结算'
  } else {
    return '未知状态'
  }
}


// 处理分页变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchOrders()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchOrders()
}

//订单姐结算
const handleOrderDetail = async (row) => {
  await ElMessageBox.confirm(
      `确定要结算订单 ${row.id} 吗？<br>
      <strong>手机号：</strong>${row.phoneNumber}<br>
      <strong>金额：</strong>￥${row.projectMoney + row.phoneMoney}`,
      '结算确认',
      {
        confirmButtonText: '确定结算',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
  )
  await orderSettlementService(row.id);
  Message.success('结算成功')
  await fetchOrders()
}

// 显示验证码详情
const showCodeDetail = (row) => {
  ElMessageBox.alert(
      `<strong>订单ID:</strong> ${row.id}<br>
     <strong>手机号:</strong> ${row.phoneNumber}<br>
     <strong>验证码:</strong> ${row.code || '暂无'}<br>
     <strong>验证码详情:</strong><br>
     <div style="max-height: 300px; overflow-y: auto; margin-top: 10px; padding: 10px; background-color: #f8f8f8; border-radius: 4px;">
       ${row.code || '暂无验证码详情'}
     </div>`,
      '验证码详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭',
        customClass: 'code-detail-dialog'
      }
  )
}

// 截取验证码文本
const truncateText = (text, length = 15) => {
  if (!text) return '暂无';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// 格式化订单ID显示
const formatOrderId = (id) => {
  if (!id) return '';
  if (id.length <= 12) return id;
  // 显示前8位...后4位
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
}

// 页面加载时获取订单列表
onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="order-container">
    <!-- 搜索条件 -->
    <div class="search-container">
      <el-form :inline="true" :model="queryForm" class="search-form">

      </el-form>
    </div>

    <!-- 订单列表 -->
    <div class="table-container">
      <el-table
          v-loading="tableLoading"
          :data="tableData.slice((pagination.currentPage - 1) * pagination.pageSize, pagination.currentPage * pagination.pageSize)"
          border
          stripe
          style="width: 100%"
      >
        <el-table-column prop="id" label="订单ID" width="140" align="center">
          <template #default="scope">
            <el-tooltip
                :content="scope.row.id"
                placement="top"
            >
              <span
                  class="order-id-text"
              >
                {{ formatOrderId(scope.row.id) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="adminNickName" label="卡商" width="150" align="center">
          <template #default="scope">
            <div v-if="scope.row.adminNickName">
              <el-avatar v-if="scope.row.adminAvatar" :size="30" :src="scope.row.adminAvatar"/>
              {{ scope.row.adminNickName }}
            </div>
            <span v-else>未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="userNickName" label="客户" width="120" align="center">
          <template #default="scope">
            <div v-if="scope.row.userNickName">
              <el-avatar v-if="scope.row.userAvatar" :size="30" :src="scope.row.userAvatar"/>
              {{ scope.row.userNickName }}
            </div>
            <span v-else>未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="手机号码" width="120" align="center"/>
        <el-table-column prop="projectMoney" label="金额" width="80" align="center">
          <template #default="scope">
            <span class="money">￥{{ scope.row.projectMoney }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="验证码" width="150" align="center">
          <template #default="scope">
            <el-tooltip
                v-if="scope.row.code"
                :content="scope.row.code"
                placement="top"
                :hide-after="100"
            >
              <span class="truncated-text">{{ truncateText(scope.row.code) }}</span>
            </el-tooltip>
            <span v-else>暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
                :type="scope.row.state === 0 ? 'danger' : (scope.row.state === 1 ? 'info' : (scope.row.state === 2 ? 'success' : ''))">
              {{ formatOrderStatus(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="projectName" label="项目名称" width="120" align="center">
          <template #default="scope">
            {{ scope.row.projectName || '暂无' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" align="center">
          <template #default="scope">
            {{ DateFormatter.format(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button
                size="small"
                type="primary"
                @click="handleOrderDetail(scope.row)"
            >
              结算
            </el-button>
            <el-button
                size="small"
                type="success"
                @click="showCodeDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="pagination.pageSizes"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
.money {
  font-size: 15px;
  font-weight: bold;
  color: #ff4d4f;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}


.table-container {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 覆盖element-plus样式 */
:deep(.el-table th) {
  background-color: #f5f7fa;
}

:deep(.el-avatar) {
  vertical-align: middle;
  margin-right: 5px;
}

.truncated-text {
  cursor: pointer;
  color: #409EFF;
}

:deep(.code-detail-dialog .el-message-box__content) {
  max-height: 500px;
  overflow-y: auto;
}
</style>