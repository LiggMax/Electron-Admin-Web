<script setup>
import {ref, reactive, onMounted} from 'vue'
import ElMessage from '../utils/message.js'
import {ElMessageBox} from 'element-plus'
import {
  getCustomerList,
} from '../api/customer.js'

// 查询条件
const queryForm = reactive({
  customerId: '',
  status: ''
})

// 客户状态选项
const statusOptions = [
  {label: '请选择客户状态', value: ''},
  {label: '正常', value: 'normal'},
  {label: '停用', value: 'disabled'},
  {label: '欠费', value: 'arrears'}
]

// 表格数据
const tableData = ref([])
const tableLoading = ref(false)

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [5, 10, 20, 50]
})

// 选中的行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 搜索方法
const handleSearch = () => {
  pagination.currentPage = 1
  fetchCustomers()
}

// 重置搜索条件
const handleReset = () => {
  queryForm.customerId = ''
  queryForm.status = ''
  pagination.currentPage = 1
  fetchCustomers()
}

// 添加客户
const handleAddCustomer = () => {
  console.log('添加客户')
  // TODO: 打开添加客户对话框
}

// 导出客户数据
const handleExport = async () => {

}

// 清除选中的行
const handleClearSelected = () => {
  selectedRows.value = []
}

// 修改客户信息
const handleEdit = (row) => {
  console.log('修改客户:', row)
  // TODO: 打开编辑对话框
}

// 修改状态
const handleToggleStatus = async (row) => {
  console.log('修改状态:', row)
}

// 删除客户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    console.log('删除客户:', row)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 批量删除选中客户
const handleBatchDelete = async () => {

}

// 获取客户列表数据
const fetchCustomers = async () => {
  tableLoading.value = true

  try {


    const res = await getCustomerList()
    tableData.value = res.data
    pagination.total = res.total
  } catch (error) {
    console.error('获取客户列表失败:', error)
    ElMessage.error('获取客户列表失败，请稍后重试')
    tableData.value = []
    pagination.total = 0
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  fetchCustomers()
})
</script>

<template>
  <div class="customer-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-form">
        <div class="form-item">
          <label>客户ID:</label>
          <el-input v-model="queryForm.customerId" placeholder="输入客户ID" clearable/>
        </div>

        <div class="form-item">
          <label>客户状态:</label>
          <el-select v-model="queryForm.status" placeholder="请选择客户状态" class="status-select">
            <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <el-button type="primary" @click="handleSearch" class="search-button">查询</el-button>
          <el-button @click="handleReset" class="reset-button">重置</el-button>
        </div>
      </div>
      
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddCustomer" class="add-button">添加客户</el-button>
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

        <el-table-column label="客户姓名" width="120" align="center">
          <template #default="scope">
            <div class="customer-avatar-name">
              <span class="customer-avatar">{{ scope.row.avatar || '👤' }}</span>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="customerId" label="客户ID" width="120" align="center"/>
        <el-table-column prop="phone" label="手机号码" width="120" align="center"/>
        <el-table-column prop="balance" label="账户余额" width="120" align="center">
          <template #default="scope">
            <span>￥{{ scope.row.balance?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="totalAmount" label="消费总额" width="120" align="center">
          <template #default="scope">
            <span>￥{{ scope.row.totalAmount?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册时间" width="120" align="center"/>
        <el-table-column prop="expireTime" label="到期时间" width="120" align="center"/>

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                @change="() => handleToggleStatus(scope.row)"
                inactive-color="#dcdfe6"
                active-color="#409eff"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="220" align="center">
          <template #default="scope">
            <div class="operation-buttons-group">
              <el-button
                  type="warning"
                  size="small"
                  @click="handleEdit(scope.row)"
                  class="table-op-button edit-button"
              >配置</el-button>
              
              <el-button
                  type="primary"
                  size="small"
                  @click="handleToggleStatus(scope.row)"
                  class="table-op-button status-button"
              >修改状态</el-button>
              
              <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row)"
                  class="table-op-button delete-button"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="pagination.pageSizes"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer-container {
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-container {
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

.status-select {
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

.customer-avatar-name {
  display: flex;
  align-items: center;
}

.customer-avatar {
  font-size: 20px;
  margin-right: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 10px 0;
}

.operation-buttons-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
}

.table-op-button {
  margin: 0;
  padding: 5px 0;
  height: 26px;
  line-height: 1;
  border-radius: 4px;
  font-size: 12px;
  width: 65px;
}

.edit-button {
  background-color: #ff9900;
  border-color: #ff9900;
}

.status-button {
  background-color: #2db7f5;
  border-color: #2db7f5;
  color: white;
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
</style> 