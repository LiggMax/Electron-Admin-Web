<template>
  <div class="bill-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <el-icon>
          <TrendCharts/>
        </el-icon>
        账单数据分析
      </h2>
      <el-button type="primary" @click="refreshData" :loading="loading" :icon="Refresh">
        刷新
      </el-button>
    </div>

    <!-- 数据统计卡片 -->
    <div class="statistics-section" v-if="orderBill">
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="8">
          <el-card class="stat-card total-amount">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon>
                  <Money/>
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ orderBill.amount }}</div>
                <div class="stat-label">总流水</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card platform-profit">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon>
                  <Wallet/>
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ orderBill.platformProfit }}</div>
                <div class="stat-label">平台收益</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card merchant-profit">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon>
                  <WalletFilled/>
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ orderBill.merchantProfit }}</div>
                <div class="stat-label">卡商收益</div>
              </div>
            </div>
          </el-card>
        </el-col>

      </el-row>
    </div>

    <!-- 图表展示区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 收益分布饼图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <el-icon>
                  <DataAnalysis/>
                </el-icon>
                <span>收益分布</span>
              </div>
            </template>
            <div ref="profitPieChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 账单类型分布饼图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <el-icon>
                  <TrendCharts/>
                </el-icon>
                <span>账单类型分布</span>
              </div>
            </template>
            <div ref="billTypePieChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="tables-section">
      <!-- 用户账单表格 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <el-card class="table-card">
            <template #header>
              <div class="table-header">
                <el-icon>
                  <User/>
                </el-icon>
                <span>用户账单记录</span>
              </div>
            </template>

            <!-- 筛选表单 -->
            <div class="filter-form">
              <el-form :model="filterForm" inline size="small">
                <el-form-item label="账单类型">
                  <el-select
                      v-model="filterForm.billType"
                      placeholder="请选择账单类型"
                      clearable
                      style="width: 120px"
                  >
                    <el-option label="充值" :value="1"/>
                    <el-option label="消费" :value="2"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="用户类型">
                  <el-select
                      v-model="filterForm.isUserType"
                      placeholder="请选择用户类型"
                      clearable
                      style="width: 120px"
                  >
                    <el-option label="客户" :value="0"/>
                    <el-option label="卡商" :value="1"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                      v-model="filterForm.purchaseTime"
                      type="month"
                      placeholder="选择月份"
                      format="YYYY-MM"
                      value-format="YYYY-MM"
                      clearable
                      style="width: 150px"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
                  <el-button @click="handleReset" :icon="Refresh">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table :data="paginatedCustomerBillList" style="width: 100%" stripe size="small" height="400">
              <el-table-column prop="nickName" label="客户" width="120" show-overflow-tooltip>
                <template #default="scope">
                  <div class="user-info">
                    <img :src="scope.row.userAvatar" alt="">
                    <el-tag type="primary" size="small">{{ scope.row.nickName }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="billType" label="消费类型" width="80" align="center">
                <template #default="scope">
                  <el-tag :type="getBillTypeTag(scope.row.billType)" size="small">
                    {{ getBillTypeName(scope.row.billType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="isUserType" label="用户类型" min-width="100" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.isUserType === 0? 'success' : 'warning'" size="small">
                    {{ scope.row.isUserType === 0 ? '客户' : '卡商' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.billType === 1" class="money-text">¥{{ scope.row.amount }}</span>
                  <span v-if="scope.row.billType === 2">¥{{ scope.row.amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="订单备注" align="center"/>
              <el-table-column prop="purchaseTime" label="时间" align="center">
                <template #default="scope">
                  <div class="time-info-container">
                    <el-icon>
                      <Clock/>
                    </el-icon>
                    {{ format(scope.row.purchaseTime) }}
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页栏 -->
            <div class="pagination-container">
              <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="totalCount"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  background
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 订单账单表格 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="table-card">
            <template #header>
              <div class="table-header">
                <el-icon>
                  <List/>
                </el-icon>
                <span>订单账单记录</span>
              </div>
            </template>

            <!-- 订单账单筛选表单 -->
            <div class="filter-form">
              <el-form :model="orderFilterForm" inline size="small">
                <el-form-item label="时间">
                  <el-date-picker
                      v-model="orderFilterForm.purchaseTime"
                      type="month"
                      placeholder="选择月份"
                      format="YYYY-MM"
                      value-format="YYYY-MM"
                      clearable
                      style="width: 150px"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleOrderSearch" :icon="Search">搜索</el-button>
                  <el-button @click="handleOrderReset" :icon="Refresh">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table :data="orderBill?.orderBills" style="width: 100%" stripe size="small" height="400">
              <el-table-column prop="orderId" label="ID" width="120" align="center">
                <template #default="scope">
                  <el-tooltip
                      :content="scope.row.orderId"
                      placement="top">
                    <span>{{ formatId(scope.row.orderId, 8, 4) }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="orderMoney" label="订单金额" width="100" align="center">
                <template #default="scope">
                  <span class="money-text order-money">¥{{ scope.row.orderMoney }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="remainingAmount" label="卡商收益" width="80" align="center">
                <template #default="scope">
                  <span class="money-text remaining">¥{{ scope.row.remainingAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="commissionAmount" label="平台收益" width="80" align="center">
                <template #default="scope">
                  <span class="money-text commission">¥{{ scope.row.commissionAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="startTime" label="时间" align="center">
                <template #default="scope">
                  <div class="time-info-container">
                    <el-icon>
                      <Clock/>
                    </el-icon>
                    {{ format(scope.row.startTime) }}
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 订单账单分页栏 -->
            <div class="pagination-container">
              <el-pagination
                  v-model:current-page="orderCurrentPage"
                  v-model:page-size="orderPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="orderTotalCount"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleOrderSizeChange"
                  @current-change="handleOrderCurrentChange"
                  background
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 订单金额对比图 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <el-icon>
                <Promotion/>
              </el-icon>
              <span>订单金额详细对比</span>
            </div>
          </template>
          <div ref="orderCompareBarChart" class="chart-container-large"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据为空时的提示 -->
    <div v-if="!loading && (!customerBillList || customerBillList.length === 0) && !orderBill" class="empty-data">
      <el-empty description="暂无账单数据">
        <el-button type="primary" @click="refreshData">重新加载</el-button>
      </el-empty>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading">
        <Loading/>
      </el-icon>
      <span>正在加载账单数据...</span>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick, onUnmounted, computed} from 'vue'
import {
  TrendCharts,
  Refresh,
  Money,
  Wallet,
  DataAnalysis,
  Promotion,
  User,
  List,
  Clock,
  Loading,
  WalletFilled,
  Search
} from '@element-plus/icons-vue'
import {ElNotification} from 'element-plus'
import {getBillList, getOrderBillList} from '../api/bill.js'
// 按需导入 ECharts
import * as echarts from 'echarts/core'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import {
  PieChart,
  BarChart
} from 'echarts/charts'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {format} from '../utils/DateFormatter.js'
import formatId from '../utils/formatId.js'

// 注册必须的组件
echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  CanvasRenderer
])

// 响应式数据
const loading = ref(false)
const customerBillList = ref([])
const orderBill = ref(null)
const chartsLoaded = ref(false)

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(10)

// 订单账单分页相关数据
const orderCurrentPage = ref(1)
const orderPageSize = ref(10)

// 筛选条件
const filterForm = ref({
  billType: '', // 账单类型
  isUserType: '', // 用户类型
  purchaseTime: '' // 账单时间（年月）
})

// 订单账单筛选条件
const orderFilterForm = ref({
  purchaseTime: '' // 订单时间（年月）
})

// 总数据量（用于分页）
const totalCount = ref(0)

// 订单账单总数据量
const orderTotalCount = ref(0)

// 图表引用
const profitPieChart = ref(null)
const billTypePieChart = ref(null)
const orderCompareBarChart = ref(null)

// 图表实例
let profitPieChartInstance = null
let billTypePieChartInstance = null
let customerBillBarChartInstance = null
let orderTrendLineChartInstance = null
let orderCompareBarChartInstance = null

// 计算属性：分页后的用户账单数据
const paginatedCustomerBillList = computed(() => {
  // 使用服务端分页，直接返回当前页数据
  return customerBillList.value
})

// 获取用户账单数据
const fetchBillData = async () => {
  loading.value = true
  try {
    const queryData = {
      pageNum: currentPage.value,// 页码
      pageSize: pageSize.value,// 每页数量
      billType: filterForm.value.billType,// 账单类型
      isUserType: filterForm.value.isUserType,// 用户类型
      purchaseTime: filterForm.value.purchaseTime,//账单时间（年月）
    }
    const response = await getBillList(queryData)

    // 根据实际API响应格式处理数据
    customerBillList.value = response.data.list || []
    totalCount.value = response.data.total || 0
    // 数据加载完成后初始化图表
    await nextTick()
    initAllCharts()

    ElNotification.success({
      title: '账单',
      message: '账单数据加载成功',
      showClose: false,
      duration: 1500
    })
  } catch (error) {
    console.error('获取账单数据失败:', error)
    ElNotification.error({
      title: '错误',
      message: '获取账单数据失败，请稍后重试',
      showClose: false,
      duration: 2000
    })
    customerBillList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}
//获取订单账单数据
const fetchOrderBillData = async () => {
  loading.value = true
  try {
    const queryData = {
      pageNum: orderCurrentPage.value,// 页码
      pageSize: orderPageSize.value,// 每页数量
      purchaseTime: orderFilterForm.value.purchaseTime,//账单时间（年月）
    }
    const response = await getOrderBillList(queryData)

    // 根据API响应格式处理数据
    orderBill.value = {
      orderBills: response.data.list || [],
    }

  } catch (error) {
    console.error('获取订单账单数据失败:', error)
    ElNotification.error({
      title: '错误',
      message: '获取订单账单数据失败，请稍后重试',
      showClose: false,
      duration: 2000
    })
    orderBill.value = null
    orderTotalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 初始化所有图表
const initAllCharts = () => {
  if (chartsLoaded.value) return

  // 使用 requestAnimationFrame 优化渲染性能
  requestAnimationFrame(() => {
    initProfitPieChart()
    initBillTypePieChart()
    initOrderCompareBarChart()
    chartsLoaded.value = true
  })
}

// 收益分布饼图
const initProfitPieChart = () => {
  if (!orderBill.value || !profitPieChart.value) return

  profitPieChartInstance = echarts.init(profitPieChart.value)
  const option = {
    tooltip: {trigger: 'item'},
    legend: {orient: 'vertical', left: 'left'},
    series: [{
      name: '收益分布',
      type: 'pie',
      radius: '50%',
      data: [
        {value: orderBill.value.merchantProfit, name: '卡商收益'},
        {value: orderBill.value.platformProfit, name: '平台收益'}
      ],
      itemStyle: {borderRadius: 8, borderColor: '#fff', borderWidth: 2}
    }],
    color: ['#5470c6', '#91cc75']
  }
  profitPieChartInstance.setOption(option)
}

// 账单类型分布饼图
const initBillTypePieChart = () => {
  if (!customerBillList.value.length || !billTypePieChart.value) return

  // 统计账单类型
  const billTypeCount = {}
  customerBillList.value.forEach(bill => {
    const typeName = getBillTypeName(bill.billType)
    billTypeCount[typeName] = (billTypeCount[typeName] || 0) + 1
  })

  const data = Object.entries(billTypeCount).map(([name, value]) => ({name, value}))

  billTypePieChartInstance = echarts.init(billTypePieChart.value)
  const option = {
    tooltip: {trigger: 'item'},
    legend: {orient: 'vertical', left: 'left'},
    series: [{
      name: '账单类型',
      type: 'pie',
      radius: '50%',
      data: data,
      itemStyle: {borderRadius: 8, borderColor: '#fff', borderWidth: 2}
    }],
    color: ['#fac858', '#ee6666', '#73c0de', '#3ba272']
  }
  billTypePieChartInstance.setOption(option)
}

// 订单金额对比图
const initOrderCompareBarChart = () => {
  if (!orderBill.value?.orderBills?.length || !orderCompareBarChart.value) return

  const orders = orderBill.value.orderBills
  const orderIds = orders.map(order => `订单${order.id}`)
  const orderMoney = orders.map(order => order.orderMoney)
  const remainingAmount = orders.map(order => order.remainingAmount)
  const commissionAmount = orders.map(order => order.commissionAmount)

  orderCompareBarChartInstance = echarts.init(orderCompareBarChart.value)
  const option = {
    tooltip: {trigger: 'axis'},
    legend: {data: ['订单金额', '卡商收益', '平台收益']},
    xAxis: [{type: 'category', data: orderIds}],
    yAxis: [{type: 'value', name: '金额(¥)'}],
    series: [
      {name: '订单金额', type: 'bar', data: orderMoney, itemStyle: {color: '#5470c6'}},
      {name: '卡商收益', type: 'bar', data: remainingAmount, itemStyle: {color: '#91cc75'}},
      {name: '平台收益', type: 'bar', data: commissionAmount, itemStyle: {color: '#fac858'}}
    ]
  }
  orderCompareBarChartInstance.setOption(option)
}

// 刷新数据
const refreshData = () => {
  fetchBillData()
}

// 获取账单类型名称
const getBillTypeName = (billType) => {
  const typeMap = {
    1: '充值',
    2: '消费',
  }
  return typeMap[billType] || '未知'
}

// 获取账单类型标签颜色
const getBillTypeTag = (billType) => {
  const tagMap = {
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'danger'
  }
  return tagMap[billType] || ''
}

// 分页事件处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  fetchBillData() // 重新获取数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchBillData() // 重新获取数据
}

// 窗口大小改变时重新调整图表
const resizeCharts = () => {
  profitPieChartInstance?.resize()
  billTypePieChartInstance?.resize()
  customerBillBarChartInstance?.resize()
  orderTrendLineChartInstance?.resize()
  orderCompareBarChartInstance?.resize()
}

// 订单账单分页事件处理
const handleOrderSizeChange = (val) => {
  orderPageSize.value = val
  orderCurrentPage.value = 1 // 重置到第一页
  fetchOrderBillData() // 重新获取数据
}

const handleOrderCurrentChange = (val) => {
  orderCurrentPage.value = val
  fetchOrderBillData() // 重新获取数据
}

// 订单账单搜索和重置方法
const handleOrderSearch = () => {
  orderCurrentPage.value = 1 // 重置到第一页
  fetchOrderBillData() // 重新获取数据
}

const handleOrderReset = () => {
  orderFilterForm.value = {
    purchaseTime: ''
  }
  orderCurrentPage.value = 1 // 重置到第一页
  fetchOrderBillData() // 重新获取数据
}

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  // 清理图表实例，防止内存泄漏
  if (profitPieChartInstance) {
    profitPieChartInstance.dispose()
    profitPieChartInstance = null
  }
  if (billTypePieChartInstance) {
    billTypePieChartInstance.dispose()
    billTypePieChartInstance = null
  }
  if (orderCompareBarChartInstance) {
    orderCompareBarChartInstance.dispose()
    orderCompareBarChartInstance = null
  }
  if (customerBillBarChartInstance) {
    customerBillBarChartInstance.dispose()
    customerBillBarChartInstance = null
  }
  if (orderTrendLineChartInstance) {
    orderTrendLineChartInstance.dispose()
    orderTrendLineChartInstance = null
  }
})

// 新增的搜索和重置方法
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchBillData() // 重新获取数据
}

const handleReset = () => {
  filterForm.value = {
    billType: '',
    isUserType: '',
    purchaseTime: ''
  }
  currentPage.value = 1 // 重置到第一页
  fetchBillData() // 重新获取数据
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBillData()
  fetchOrderBillData()
  window.addEventListener('resize', resizeCharts)
})

</script>

<style scoped>
.bill-container {
  padding: 20px;
  background: transparent;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  border-radius: 5px;
}

.user-info img {
  width: 23px;
  margin-right: 3px;
}

.page-title {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.statistics-section {
  margin-bottom: 30px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.total-amount {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.merchant-profit {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-card.platform-profit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card, .table-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header, .table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart-container-large {
  height: 400px;
  width: 100%;
}

.tables-section {
  margin-bottom: 30px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

.filter-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-form .el-form-item {
  margin-bottom: 0;
}

.money-text {
  font-weight: 600;
  color: #ff4d4f;
  font-size: 12px;
}

.money-text.order-money {
  color: #fa1b1b;
}

.money-text.remaining {
  color: #67c23a;
}

.money-text.commission {
  color: #e6a23c;
}

.empty-data {
  text-align: center;
  padding: 60px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-container {
  text-align: center;
  padding: 60px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 16px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin: 0 auto;
  }

  .chart-container {
    height: 250px;
  }

  .chart-container-large {
    height: 300px;
  }
}


:deep(.el-table th) {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

</style>