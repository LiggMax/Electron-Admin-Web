<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import ElMessage from '../utils/message.js'
import { ElMessageBox } from 'element-plus'
import { getProjectList } from '../api/customer.js'

// 查询条件
const queryForm = reactive({
  projectName: '',
})

// 表格数据
const tableData = ref([])
const originalData = ref([]) // 保存原始数据，用于本地搜索
const tableLoading = ref(false)

// 处理本地搜索，根据查询条件过滤数据
const filteredData = computed(() => {
  if (!queryForm.projectName) {
    return originalData.value
  }
  
  return originalData.value.filter(item => {
    return item.projectName.toLowerCase().includes(queryForm.projectName.toLowerCase())
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
  tableData.value = filteredData.value
}

// 重置搜索条件
const handleReset = () => {
  queryForm.projectName = ''
  tableData.value = originalData.value
}

// 添加项目
const handleAddProject = () => {
  console.log('添加项目')
  // TODO: 打开添加项目对话框
}

// 导出项目数据
const handleExport = async () => {
  // 导出逻辑
}

// 清除选中的行
const handleClearSelected = () => {
  selectedRows.value = []
}

// 修改项目信息
const handleEdit = (row) => {
  console.log('修改项目:', row)
  // TODO: 打开编辑对话框
}

// 删除项目
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    console.log('删除项目:', row)
    ElMessage.success('删除成功')
    fetchProjects() // 重新获取数据
  } catch (error) {
    // 用户取消删除
  }
}

// 批量删除选中项目
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的项目')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个项目吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('批量删除项目:', selectedRows.value)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    await fetchProjects() // 重新获取数据
  } catch (error) {
    // 用户取消删除
  }
}

// 处理API响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.projectId,
    projectName: item.projectName,
    price: item.projectPrice,
    createdAt: item.projectCreatedAt
  }))
}

// 获取项目列表数据
const fetchProjects = async () => {
  tableLoading.value = true
  try {
    const response = await getProjectList()
    const processedData = handleResponseData(response.data)
    originalData.value = processedData
    tableData.value = processedData
  } catch (error) {
    console.error('获取项目列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="project-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-form">
        <div class="form-item">
          <label>项目名称:</label>
          <el-input v-model="queryForm.projectName" placeholder="输入项目名称" clearable/>
        </div>
        
        <div class="form-item">
          <el-button type="primary" @click="handleSearch" class="search-button">查询</el-button>
          <el-button @click="handleReset" class="reset-button">重置</el-button>
        </div>
      </div>
      
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddProject" class="add-button">添加项目</el-button>
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
        <el-table-column prop="id" label="项目ID" width="100" align="center"/>
        <el-table-column prop="projectName" label="项目名称" min-width="150" align="center"/>
        <el-table-column prop="price" label="项目价格" width="120" align="center">
          <template #default="scope">
            ￥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center"/>

        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <div class="operation-buttons-group">
              <el-button
                  type="warning"
                  size="small"
                  @click="handleEdit(scope.row)"
                  class="table-op-button edit-button"
              >修改</el-button>
              
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
    </div>
  </div>
</template>

<style scoped>
.project-container {
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

.operation-buttons-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
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