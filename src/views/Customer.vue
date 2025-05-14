<script setup>
import {ref, reactive, onMounted} from 'vue'
import ElMessage from '../utils/message.js'
import {ElMessageBox} from 'element-plus'
import {
  getCustomerList,
  updateCustomerStatus
} from '../api/customer.js'
import DateFormatter from '../utils/DateFormatter.js'

// 查询条件
const queryForm = reactive({
  userId: '',
  userStatus: ''
})

// 客户状态选项
const statusOptions = [
  {label: '请选择客户状态', value: ''},
  {label: '正常', value: 1},
  {label: '停用', value: 0}
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
  queryForm.userId = ''
  queryForm.userStatus = ''
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
  // 导出逻辑
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
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要${row.status ? '启用' : '停用'}用户 "${row.name}" 吗？`, 
      '提示', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: row.status ? 'success' : 'warning'
      }
    )
    
    // 设置加载状态
    row.statusLoading = true
    
    // 准备请求数据
    const data = {
      userId: row.id,
      userStatus: row.status ? 1 : 0  // 将布尔值转换为 1/0
    }
    
    // 调用API
    const response = await updateCustomerStatus(data)
    
    if (response.code === 200) {
      ElMessage.success(`已${row.status ? '启用' : '停用'}用户: ${row.name}`)
    } else {
      // 如果API调用失败，恢复状态并显示错误消息
      row.status = !row.status
      ElMessage.error(response.message || `更新用户状态失败`)
    }
  } catch (error) {
    // 判断是否是用户取消操作
    if (error === 'cancel' || error.toString().includes('cancel')) {
      // 用户取消操作，恢复开关状态
      row.status = !row.status
      return
    }
    
    // 发生错误时恢复状态
    row.status = !row.status
    console.error('更新用户状态失败:', error)
    ElMessage.error('更新用户状态失败，请稍后重试')
  } finally {
    // 无论成功失败，都关闭加载状态
    row.statusLoading = false
  }
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
  // 批量删除逻辑
}

// 处理API响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.userId,
    avatar: item.userAvatar,
    name: item.nickName || item.account,
    account: item.account,
    email: item.email || '未设置',
    loginTime: item.loginTime ? DateFormatter.format(item.loginTime) : '暂无登录',
    rawLoginTime: item.loginTime, // 保存原始登录时间用于计算相对时间
    createdAt: DateFormatter.format(item.createdAt),
    updatedAt: item.updatedAt ? DateFormatter.format(item.updatedAt) : '暂无更新',
    status: item.userStatus === 1,
    statusLoading: false // 添加状态加载标识
  }))
}

// 获取客户列表数据
const fetchCustomers = async () => {
  tableLoading.value = true

  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      userId: queryForm.userId,
      userStatus: queryForm.userStatus
    }
    
    const response = await getCustomerList(params)
    
    if (response.code === 200) {
      tableData.value = handleResponseData(response.data)
      pagination.total = response.data.length // 注意：实际项目中可能需要从响应中获取总记录数
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
      tableData.value = []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，请稍后重试')
    tableData.value = []
    pagination.total = 0
  } finally {
    tableLoading.value = false
  }
}

// 页码变化
const handleCurrentChange = () => {
  fetchCustomers()
}

// 每页条数变化
const handleSizeChange = () => {
  pagination.currentPage = 1
  fetchCustomers()
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
          <label>用户ID:</label>
          <el-input v-model="queryForm.userId" placeholder="输入用户ID" clearable/>
        </div>

        <div class="form-item">
          <label>用户状态:</label>
          <el-select v-model="queryForm.userStatus" placeholder="请选择用户状态" class="status-select">
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
        <el-button type="primary" @click="handleAddCustomer" class="add-button">添加用户</el-button>
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

        <el-table-column label="用户信息" width="150" align="center">
          <template #default="scope">
            <div class="customer-avatar-name">
              <span class="customer-avatar">
                <img v-if="scope.row.avatar" :src="scope.row.avatar" class="avatar-img" alt="头像" />
                <span v-else class="default-avatar">{{ scope.row.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
              </span>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="用户ID" width="150" align="center"/>
        <el-table-column prop="account" label="账号" width="120" align="center"/>
        <el-table-column prop="email" label="邮箱" width="150" align="center"/>
        <el-table-column prop="loginTime" label="登录时间" width="180" align="center">
          <template #default="scope">
            <span :class="{'no-login': scope.row.loginTime === '暂无登录'}">
              {{ scope.row.loginTime }}
              <span v-if="scope.row.loginTime !== '暂无登录'" class="relative-time">
                ({{ DateFormatter.relativeTime(scope.row.rawLoginTime) }})
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" align="center"/>
        <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
          <template #default="scope">
            {{ scope.row.updatedAt || '暂无更新' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                @change="() => handleToggleStatus(scope.row)"
                inactive-color="#dcdfe6"
                active-color="#409eff"
                :loading="scope.row.statusLoading"
                :disabled="scope.row.statusLoading"
                :active-value="true"
                :inactive-value="false"
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
            small
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

.no-login {
  color: #909399;
  font-style: italic;
}

.relative-time {
  color: #409EFF;
  font-size: 12px;
  margin-left: 5px;
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