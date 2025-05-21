<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrderList } from '../api/order.js'
import ElMessage from '../utils/message.js'
import { ElMessageBox } from 'element-plus'
import DateFormatter from '../utils/DateFormatter.js'

// 订单数据
const tableData = ref([])
const tableLoading = ref(false)

// 订单状态选项
const orderStatusOptions = [
  { label: '全部', value: '' },
  { label: '未分配', value: 0 },
  { label: '已分配', value: 1 }
]

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
    if (res.code === 200) {
      tableData.value = res.data
      pagination.total = res.data.length
    } else {
      ElMessage.error(res.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表出错:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 搜索方法
const handleSearch = () => {
  pagination.currentPage = 1
  fetchOrders()
}

// 重置搜索条件
const handleReset = () => {
  queryForm.orderId = ''
  queryForm.phoneNumber = ''
  queryForm.status = ''
  queryForm.userId = ''
  queryForm.startDate = ''
  queryForm.endDate = ''
  pagination.currentPage = 1
  fetchOrders()
}

// 格式化订单状态
const formatOrderStatus = (row) => {
  if (row.state === 0) {
    return '未使用'
  } else if (row.state === 1) {
    return '已使用'
  }else if (row.state === 2) {
    return '已结算'
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

// 页面加载时获取订单列表
onMounted(() => {
  fetchOrders()
})

// 查看订单详情
const handleOrderDetail = (row) => {

}

// 分配订单
const handleAssignOrder = (row) => {
  ElMessageBox.confirm(
    '确定要分配此订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    // 这里应该调用API进行订单分配操作
    ElMessage.success('订单分配成功')
    // 重新获取列表
    await fetchOrders()
  }).catch(() => {
    // 取消操作
  })
}
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
        <el-table-column prop="id" label="订单ID" width="100" align="center" />
        <el-table-column prop="adminNickName" label="卡商" width="120" align="center">
          <template #default="scope">
            <div v-if="scope.row.adminNickName">
              <el-avatar v-if="scope.row.adminAvatar" :size="30" :src="scope.row.adminAvatar" />
              {{ scope.row.adminNickName }}
            </div>
            <span v-else>未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="userNickName" label="客户" width="120" align="center">
          <template #default="scope">
            <div v-if="scope.row.userNickName">
              <el-avatar v-if="scope.row.userAvatar" :size="30" :src="scope.row.userAvatar" />
              {{ scope.row.userNickName }}
            </div>
            <span v-else>未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="手机号码" width="120" align="center" />
        <el-table-column prop="money" label="金额" width="80" align="center">
          <template #default="scope">
            {{ scope.row.money }} 元
          </template>
        </el-table-column>
        <el-table-column prop="code" label="验证码" width="120" align="center">
          <template #default="scope">
            {{ scope.row.code || '暂无' }}
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.state === 0 ? 'danger' : 'success'">
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
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleOrderDetail(scope.row)"
            >
              结算
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

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.date-separator {
  margin: 0 10px;
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
</style> 