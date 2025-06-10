<script setup>
import {ref, reactive, onMounted, computed, nextTick} from 'vue'
import Message from '../utils/message.js'
import {ElMessageBox} from 'element-plus'
import {
  getProjectListService,
  addProjectService,
  deleteProjectService,
  editProjectService
} from "../api/project.js";
import DateFormatter from "../utils/DateFormatter.js";
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


// 统一的项目弹窗相关
const projectDialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'

const projectForm = reactive({
  id: '',
  projectName: '',
  projectPrice: '',
  keyword: '',
  codeLength: '',
})
const projectLoading = ref(false)
const projectFormRef = ref(null)

// 弹窗标题
const dialogTitle = computed(() => {
  return dialogMode.value === 'add' ? '添加项目' : '编辑项目'
})

// 项目验证规则
const projectRules = {
  projectName: [
    {required: true, message: '请输入项目名称', trigger: 'blur'},
    {min: 1, max: 50, message: '项目名称长度需在1到50个字符之间', trigger: 'blur'}
  ],
  projectPrice: [
    {required: true, message: '请输入项目价格', trigger: 'blur'},
    {pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/, message: '价格必须是有效的金额，最多两位小数', trigger: 'blur'}
  ],
  keyword: [
    {required: true, message: '请输入验证码参数', trigger: 'blur'},
    {min: 1, max: 50, message: '关键字长度需在1到50个字符之间', trigger: 'blur'}
  ],
  codeLength: [
    {required: true, message: '请输入验证码位数', trigger: 'blur'},
    {pattern: /^([1-9]|1[0-9]|20)$/, message: '验证码位数必须是1到20之间的整数', trigger: 'blur'}
  ]
}

// 添加项目
const handleAddProject = () => {
  dialogMode.value = 'add'
  // 重置表单数据
  projectForm.id = ''
  projectForm.projectName = ''
  projectForm.projectPrice = ''
  projectForm.keyword = ''
  projectForm.codeLength = ''

  // 显示弹窗
  projectDialogVisible.value = true

  // 下一帧后重置表单校验结果
  nextTick(() => {
    projectFormRef.value?.resetFields()
    projectFormRef.value?.clearValidate()
  })
}

// 修改项目信息
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  // 填充表单数据
  projectForm.id = row.id
  projectForm.projectName = row.projectName
  projectForm.projectPrice = row.hasPrice ? row.price : ''
  projectForm.keyword = row.keyword
  projectForm.codeLength = row.codeLength
  // 显示弹窗
  projectDialogVisible.value = true
}

// 取消操作
const cancelProject = () => {
  projectDialogVisible.value = false
  // 清空表单数据
  projectForm.id = ''
  projectForm.projectName = ''
  projectForm.projectPrice = ''
  projectForm.keyword = ''
  projectForm.codeLength = ''
}

// 提交表单
const submitProject = async () => {
  if (!projectFormRef.value) return

  try {
    // 表单校验
    await projectFormRef.value.validate()

    projectLoading.value = true

    if (dialogMode.value === 'add') {
      // 添加项目
      const projectData = {
        projectName: projectForm.projectName,
        projectPrice: Number(projectForm.projectPrice),
        keyword: projectForm.keyword,
        codeLength: Number(projectForm.codeLength)
      }
      await addProjectService(projectData)
      Message.success('项目添加成功')
    } else {
      // 编辑项目
      const projectData = {
        projectId: projectForm.id,
        projectPrice: Number(projectForm.projectPrice),
        projectName:  projectForm.projectName,
        keyword: projectForm.keyword,
        codeLength: Number(projectForm.codeLength)
      }
      await editProjectService(projectData)
      Message.success('项目更新成功')
    }

    projectDialogVisible.value = false
    await fetchProjects() // 刷新数据
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('操作失败:', error)
      Message.error('操作失败: ' + error.message)
    }
  } finally {
    projectLoading.value = false
  }
}

// 清除选中的行
const handleClearSelected = () => {
  selectedRows.value = []
}

// 删除项目
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 获取项目ID
    const projectId = typeof row === 'object' ? row.id : row

    // 调用删除API
    await deleteProjectService(projectId)
    Message.success('删除成功')
    await fetchProjects() // 重新获取数据
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel' && !error.toString().includes('cancel')) {
      Message.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 批量删除选中项目
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请先选择要删除的项目')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个项目吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 获取选中项目的ID列表
    const projectIds = selectedRows.value.map(item => item.id)

    // 逐个删除项目
    let errorCount = 0
    for (const projectId of projectIds) {
      try {
        await deleteProjectService(projectId)
      } catch (error) {
        console.error('删除项目失败:', error)
        errorCount++
      }
    }

    if (errorCount === 0) {
      Message.success('批量删除成功')
    } else if (errorCount < projectIds.length) {
      Message.warning(`部分删除成功，${errorCount}个项目删除失败`)
    } else {
      Message.error('批量删除失败')
    }

    selectedRows.value = []
    await fetchProjects() // 重新获取数据
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel' && !error.toString().includes('cancel')) {
      Message.error('批量删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 处理API响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.projectId,
    projectName: item.projectName,
    price: item.projectPrice !== null ? Number(item.projectPrice) : 0,
    hasPrice: item.projectPrice !== null,
    keyword: item.keyword || '',
    codeLength: item.codeLength || '',
    createdAt: item.projectCreatedAt ? DateFormatter.format(item.projectCreatedAt) : '未知时间',
    updateAt: item.projectUpdateAt ? DateFormatter.format(item.projectUpdateAt) : '未知时间'
  }))
}

// 获取项目列表数据
const fetchProjects = async () => {
  tableLoading.value = true
  try {
    const response = await getProjectListService()
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
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddProject" class="add-button">添加项目</el-button>
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
        <el-table-column prop="id" label="项目ID" width="190" align="center"/>
        <el-table-column prop="projectName" label="项目名称" min-width="150" align="center"/>
        <el-table-column prop="price" label="项目价格" width="120" align="center">
          <template #default="scope">
            <span v-if="scope.row.hasPrice" class="price">￥{{ scope.row.price.toFixed(2) }}</span>
            <span v-else class="no-price">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="keyword" label="关键字" width="120" align="center">
          <template #default="scope">
            <el-tooltip 
              :content="scope.row.keyword" 
              placement="top" 
            >
              <div class="keyword-cell">{{ scope.row.keyword }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="codeLength" label="验证码参数" width="110" align="center"/>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center"/>
        <el-table-column prop="updateAt" label="更新时间" width="180" align="center"/>

        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <div class="operation-buttons-group">
              <el-button
                  type="warning"
                  size="small"
                  @click="handleEdit(scope.row)"
                  class="table-op-button edit-button"
              >修改
              </el-button>

              <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  class="table-op-button delete-button"
              >删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 项目弹窗 -->
    <el-dialog
        v-model="projectDialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @closed="cancelProject"
    >
      <el-form
          ref="projectFormRef"
          :model="projectForm"
          :rules="projectRules"
          label-width="100px"
          label-position="right"
          status-icon
      >
        <el-form-item v-if="dialogMode === 'edit'" label="项目ID">
          <el-input v-model="projectForm.id" disabled/>
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input
              v-model="projectForm.projectName"
              placeholder="请输入项目名称"
          />
        </el-form-item>
        <el-form-item label="项目价格" prop="projectPrice">
          <el-input
              v-model="projectForm.projectPrice"
              placeholder="请输入项目价格"
              class="price-input"
          >
            <template #prefix>￥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="输入关键字" prop="keyword">
          <el-input
              v-model="projectForm.keyword"
              placeholder="请输入关键字"
          />
        </el-form-item>
        <el-form-item label="验证码数" prop="codeLength">
          <el-input
              v-model="projectForm.codeLength"
              placeholder="关键字后多少位是验证码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelProject">取消</el-button>
          <el-button type="primary" @click="submitProject" :loading="projectLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
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

.form-item label {
  margin-right: 8px;
  white-space: nowrap;
}

.operation-buttons {
  display: flex;
  align-items: center;
}

.add-button {
  background-color: #8f90ff;
  border-color: #8e8ff0;
  margin-right: 10px;
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

.dialog-footer {
  text-align: right;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.no-price {
  color: #909399;
  font-style: italic;
}

/* 价格输入框样式 */
.price-input :deep(.el-input__prefix) {
  color: #f56c6c;
  font-weight: bold;
}

.price-input :deep(.el-input__suffix) {
  color: #909399;
}

.keyword-cell {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  line-height: 1.2;
  max-height: 2.4em;
}

</style>