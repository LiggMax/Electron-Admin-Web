<template>
  <div class="bill-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><TrendCharts /></el-icon>
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
                <el-icon><Money /></el-icon>
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
                <el-icon><Wallet /></el-icon>
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
                <el-icon><WalletFilled /></el-icon>
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
                <el-icon><DataAnalysis /></el-icon>
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
                <el-icon><TrendCharts /></el-icon>
                <span>账单类型分布</span>
              </div>
            </template>
            <div ref="billTypePieChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 订单金额对比图 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <el-icon><Promotion /></el-icon>
                <span>订单金额详细对比</span>
              </div>
            </template>
            <div ref="orderCompareBarChart" class="chart-container-large"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="tables-section">
      <el-row :gutter="20">
        <!-- 客户账单表格 -->
        <el-col :span="12">
          <el-card class="table-card">
            <template #header>
              <div class="table-header">
                <el-icon><User /></el-icon>
                <span>客户账单记录</span>
              </div>
            </template>
            <el-table :data="customerBillList" style="width: 100%" stripe size="small" height="400">
              <el-table-column prop="id" label="账单ID" width="120" show-overflow-tooltip>
                <template #default="scope">
                  <el-tag type="primary" size="small">{{ scope.row.id.slice(-8) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="billType" label="类型" width="80" align="center">
                <template #default="scope">
                  <el-tag :type="getBillTypeTag(scope.row.billType)" size="small">
                    {{ getBillTypeName(scope.row.billType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.billType === 1" class="money-text">¥{{ scope.row.amount }}</span>
                  <span v-if="scope.row.billType === 2" >¥{{ scope.row.amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="订单备注" align="center"/>
              <el-table-column prop="purchaseTime" label="时间" align="center">
                <template #default="scope">
                  <div class="time-info">
                    <el-icon><Clock /></el-icon>
                    {{ format(scope.row.purchaseTime) }}
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- 订单账单表格 -->
        <el-col :span="12">
          <el-card class="table-card">
            <template #header>
              <div class="table-header">
                <el-icon><List /></el-icon>
                <span>订单账单记录</span>
              </div>
            </template>
            <el-table :data="orderBill?.orderBills" style="width: 100%" stripe size="small" height="400">
              <el-table-column prop="id" label="ID" width="60" align="center" />
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
                  <div class="time-info">
                    {{ format(scope.row.startTime) }}
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据为空时的提示 -->
    <div v-if="!loading && (!customerBillList || customerBillList.length === 0) && !orderBill" class="empty-data">
      <el-empty description="暂无账单数据">
        <el-button type="primary" @click="refreshData">重新加载</el-button>
      </el-empty>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>正在加载账单数据...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
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
  WalletFilled
} from '@element-plus/icons-vue'
import {ElMessage, ElNotification} from 'element-plus'
import { getBillList } from '../api/bill.js'
import * as echarts from 'echarts'
import {format} from '../utils/DateFormatter.js'
// 响应式数据
const loading = ref(false)
const customerBillList = ref([])
const orderBill = ref(null)

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

// 获取账单数据
const fetchBillData = async () => {
  loading.value = true
  try {
    const response = await getBillList()
    console.log('API响应数据:', response)

    // 根据实际响应结构适配数据
      const data = response.data
      customerBillList.value = data.customerBill || []
      orderBill.value = data.orderBill || null


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
  } finally {
    loading.value = false
  }
}

// 初始化所有图表
const initAllCharts = () => {
  initProfitPieChart()
  initBillTypePieChart()
  initOrderCompareBarChart()
}

// 收益分布饼图
const initProfitPieChart = () => {
  if (!orderBill.value || !profitPieChart.value) return

  profitPieChartInstance = echarts.init(profitPieChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '收益分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: orderBill.value.merchantProfit, name: '卡商收益' },
          { value: orderBill.value.platformProfit, name: '平台收益' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ],
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

  const data = Object.entries(billTypeCount).map(([name, value]) => ({ name, value }))

  billTypePieChartInstance = echarts.init(billTypePieChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '账单类型',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ],
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
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['订单金额', '卡商收益', '平台收益']
    },
    xAxis: [
      {
        type: 'category',
        data: orderIds,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额(¥)',
        axisLabel: {
          formatter: '¥{value}'
        }
      }
    ],
    series: [
      {
        name: '订单金额',
        type: 'bar',
        data: orderMoney,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '卡商收益',
        type: 'bar',
        data: remainingAmount,
        itemStyle: {
          color: '#91cc75'
        }
      },
      {
        name: '平台收益',
        type: 'bar',
        data: commissionAmount,
        itemStyle: {
          color: '#fac858'
        }
      }
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

// 窗口大小改变时重新调整图表
const resizeCharts = () => {
  profitPieChartInstance?.resize()
  billTypePieChartInstance?.resize()
  customerBillBarChartInstance?.resize()
  orderTrendLineChartInstance?.resize()
  orderCompareBarChartInstance?.resize()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBillData()
  window.addEventListener('resize', resizeCharts)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  profitPieChartInstance?.dispose()
  billTypePieChartInstance?.dispose()
  customerBillBarChartInstance?.dispose()
  orderTrendLineChartInstance?.dispose()
  orderCompareBarChartInstance?.dispose()
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

.money-text {
  font-weight: 600;
  color: #ff4d4f;
  font-size: 12px;
}

.money-text.order-money {
  color: #409eff;
}

.money-text.remaining {
  color: #67c23a;
}

.money-text.commission {
  color: #e6a23c;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #666;
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

:deep(.el-table .el-table__row:hover > td) {
  background-color: #f5f7fa !important;
}

</style>
