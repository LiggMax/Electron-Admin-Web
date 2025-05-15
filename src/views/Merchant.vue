<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import ElMessage from '../utils/message.js'
import {ElMessageBox} from 'element-plus'
import {getCardList} from "../api/card.js";

// 查询条件
const queryForm = reactive({
  userId: '',
  account: ''
})

// 表格数据
const tableData = ref([])
const originalData = ref([]) // 保存原始数据，用于本地搜索
const tableLoading = ref(false)

// 处理本地搜索，根据查询条件过滤数据
const filteredData = computed(() => {
  if (!queryForm.userId && !queryForm.account) {
    return originalData.value
  }
  
  return originalData.value.filter(item => {
    const idMatch = !queryForm.userId || String(item.id).includes(queryForm.userId)
    const accountMatch = !queryForm.account || item.account.toLowerCase().includes(queryForm.account.toLowerCase())
    return idMatch && accountMatch
  })
})

// 选中的行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 搜索方法
const handleSearch = () => {
  // 本地搜索，不需要重新请求数据
  tableData.value = filteredData.value
}

// 重置搜索条件
const handleReset = () => {
  queryForm.userId = ''
  queryForm.account = ''
  tableData.value = originalData.value
}

// 添加卡商
const handleAddMerchant = () => {
  console.log('添加卡商')
  // TODO: 打开添加卡商对话框
}

// 导出卡商数据
const handleExport = async () => {
  // 导出逻辑
}

// 清除选中的行
const handleClearSelected = () => {
  selectedRows.value = []
}

// 修改卡商信息
const handleEdit = (row) => {
  console.log('修改卡商:', row)
  // TODO: 打开编辑对话框
}

// 删除卡商
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该卡商吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    console.log('删除卡商:', row)
    ElMessage.success('删除成功')
    fetchMerchants() // 重新获取数据
  } catch (error) {
    // 用户取消删除
  }
}

// 批量删除选中卡商
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的卡商')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个卡商吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('批量删除卡商:', selectedRows.value)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    await fetchMerchants()
  } catch (error) {
    // 用户取消删除
  }
}

// 处理API响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.userId,
    avatar: item.userAvatar,
    name: item.nickName || item.account,
    account: item.account,
    email: item.email || '未设置',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }))
}

// 获取卡商列表数据
const fetchMerchants = async () => {
  tableLoading.value = true

  try {
    const response = await getCardList()
      const processedData = handleResponseData(response.data)
      originalData.value = processedData // 保存原始数据
      tableData.value = processedData
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  fetchMerchants()
})
</script>

<template>
  <div class="merchant-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-form">
        <div class="form-item">
          <label>卡商ID:</label>
          <el-input v-model="queryForm.userId" placeholder="输入卡商ID" clearable/>
        </div>

        <div class="form-item">
          <label>账号:</label>
          <el-input v-model="queryForm.account" placeholder="请输入账号" class="account-input" clearable/>
        </div>
        
        <div class="form-item">
          <el-button type="primary" @click="handleSearch" class="search-button">查询</el-button>
          <el-button @click="handleReset" class="reset-button">重置</el-button>
        </div>
      </div>
      
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddMerchant" class="add-button">添加卡商</el-button>
        <el-button @click="handleExport" class="export-button">导出</el-button>
      </div>
    </div>
    
    <!-- 表格区域 -->
    <div class="table-container">
      <div class="selected-info" v-if="selectedRows.length > 0">
        <el-alert type="info" :closable="false">
          <template #default>
            <div class="selected-text">
              已选择 {{ selectedRows.length }} 项
              <div>
                <el-button type="danger" size="small" @click="handleBatchDelete" class="batch-delete-button">删除
                </el-button>
                <span class="clear-text" @click="handleClearSelected">清除</span>
              </div>
            </div>
          </template>
        </el-alert>
      </div>

      <el-table
          :data="tableData"
          v-loading="tableLoading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          border
          stripe
          highlight-current-row
      >
        <el-table-column type="selection" width="55"/>

        <el-table-column label="卡商信息" width="150" align="center">
          <template #default="scope">
            <div class="merchant-avatar-name">
              <span class="merchant-avatar">
                <img v-if="scope.row.avatar" :src="scope.row.avatar" class="avatar-img" alt="头像" />
                <span v-else class="default-avatar">{{ scope.row.name?.charAt(0)?.toUpperCase() || 'M' }}</span>
              </span>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="卡商ID" width="150" align="center"/>
        <el-table-column prop="account" label="账号" width="120" align="center"/>
        <el-table-column prop="email" label="邮箱" width="180" align="center"/>
        <el-table-column prop="createdAt" label="注册时间" width="180" align="center"/>
        <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
          <template #default="scope">
            {{ scope.row.updatedAt || '暂无更新' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="150" align="center">
          <template #default="scope">
            <div class="operation-buttons-group">
              <div class="button-row">
                <el-button
                    type="warning"
                    size="small"
                    @click="handleEdit(scope.row)"
                    class="table-op-button edit-button"
                >修改</el-button>
                
                <el-button
                    type="primary"
                    size="small"
                    @click=""
                    class="table-op-button reset-button"
                >密码重置</el-button>
              </div>
              <div class="button-row">
                <el-button
                    type="success"
                    size="small"
                    @click=""
                    class="table-op-button add-phone-button"
                >添加号码</el-button>
                <el-button
                    type="danger"
                    size="small"
                    @click="handleDelete(scope.row)"
                    class="table-op-button delete-button"
                >删除</el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.merchant-container {
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 10px;
}

.form-item label {
  margin-right: 8px;
  white-space: nowrap;
}

.account-input {
  width: 180px;
}

.operation-buttons {
  display: flex;
  align-items: center;
}

.add-button {
  background-color: #8e8ff0;
  border-color: #8e8ff0;
  margin-right: 10px;
  font-size: 16px;
  padding: 12px 20px;
  height: auto;
}

.export-button {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
  font-size: 16px;
  padding: 12px 20px;
  height: auto;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.selected-info {
  margin-bottom: 10px;
}

.selected-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.clear-text {
  color: #409eff;
  cursor: pointer;
  margin-left: 10px;
}

.batch-delete-button {
  padding: 2px 8px;
  height: 24px;
  line-height: 20px;
}

.merchant-avatar-name {
  display: flex;
  align-items: center;
}

.merchant-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f7fa;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.operation-buttons-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.table-op-button {
  margin: 0;
  padding: 2px 0;
  height: 24px;
  line-height: 1;
  border-radius: 4px;
  font-size: 12px;
  width: 65px;
}

.edit-button {
  background-color: #ff9900;
  border-color: #ff9900;
}

.reset-button {
  background-color: #409eff;
  border-color: #409eff;
}

.add-phone-button {
  background-color: #67c23a;
  border-color: #67c23a;
}

.delete-button {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

:deep(.el-table .cell) {
  padding: 0 10px;
}

:deep(.el-table th) {
  font-weight: bold;
}
</style>