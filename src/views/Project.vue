<script setup>
import {ref, reactive, onMounted, computed, nextTick} from 'vue'
import Message from '../utils/message.js'
import {ElMessageBox, ElDropdown, ElDropdownMenu, ElDropdownItem} from 'element-plus'
import {Edit, Delete, Upload, ArrowDown, Postcard, Clock} from '@element-plus/icons-vue'
import {
  getProjectListService,
  addProjectService,
  deleteProjectService,
  editProjectService,
  uploadIconService,
  setProjectKeywordService,
  getProjectKeywordListService,
  deleteProjectKeywordService,
  editProjectKeywordService
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

computed(() => {
  if (!queryForm.projectName) {
    return originalData.value
  }

  return originalData.value.filter(item => {
    return item.projectName.toLowerCase().includes(queryForm.projectName.toLowerCase())
  })
});
// 选中的行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}


// 统一的项目弹窗相关
const projectDialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'

const projectForm = reactive({
  id: '',
  projectName: '',
  projectPrice: '',
  expirationTime: '',
})
const projectLoading = ref(false)
const projectFormRef = ref(null)

// 弹窗标题
const dialogTitle = computed(() => {
  return dialogMode.value === 'add' ? '添加项目' : '编辑项目'
})

// 项目验证规则
const projectRules = computed(() => {
  const baseRules = {
    projectName: [
      {required: true, message: '请输入项目名称', trigger: 'blur'},
      {min: 1, max: 50, message: '项目名称长度需在1到50个字符之间', trigger: 'blur'}
    ],
    projectPrice: [
      {required: true, message: '请输入项目价格', trigger: 'blur'},
      {pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/, message: '价格必须是有效的金额，最多两位小数', trigger: 'blur'}
    ]
  }
  
  // 只在编辑模式下添加过期时间验证
  if (dialogMode.value === 'edit') {
    baseRules.expirationTime = [
      {required: true, message: '请输入过期时间', trigger: 'blur'},
      {pattern: /^(1[5-9]|[2-9]\d|[1-9]\d{2}|1[0-3]\d{2}|14[0-3]\d|1440)$/, message: '过期时间必须是15-1440分钟之间的整数', trigger: 'blur'}
    ]
  }
  
  return baseRules
})

// 添加项目
const handleAddProject = () => {
  dialogMode.value = 'add'
  // 重置表单数据
  projectForm.id = ''
  projectForm.projectName = ''
  projectForm.projectPrice = ''

  // 显示弹窗
  projectDialogVisible.value = true

  // 下一帧后重置表单校验结果
  nextTick(() => {
    pprojectForm.id = ''
    projectForm.projectName = ''
    projectForm.projectPrice = ''
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
  projectForm.expirationTime = row.expirationTime
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
  projectForm.expirationTime = ''
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
        projectPrice: Number(projectForm.projectPrice)
      }
      await addProjectService(projectData)
      Message.success('项目添加成功')
    } else {
      // 编辑项目
      const projectData = {
        projectId: projectForm.id,
        projectPrice: Number(projectForm.projectPrice),
        projectName: projectForm.projectName,
        expirationTime: Number(projectForm.expirationTime)
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

// 图标上传相关
const iconDialogVisible = ref(false)
const currentProject = ref(null)
const iconLoading = ref(false)
const imageUrl = ref('')
const fileInput = ref(null)

// 关键词编辑弹窗相关
const keywordDialogVisible = ref(false)
const keywordForm = reactive({
  id: '',
  projectName: '',
  keywords: [] // 改为数组存储多个关键词，每项包含 {keyword: '', codeLength: ''}
})
const keywordFormRef = ref(null)

// 新增关键词临时数据
const newKeyword = reactive({
  keyword: '',
  codeLength: ''
})
const newKeywordRef = ref(null)

// 打开上传图标弹窗
const uploadIcon = (row) => {
  currentProject.value = row
  imageUrl.value = row.icon || ''
  iconDialogVisible.value = true
}

// 选择图片
const handleSelectFile = () => {
  fileInput.value.click()
}

// 图片变更处理
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 验证文件大小（限制为10MB）
  const isLt2M = file.size / 1024 / 1024 < 10
  if (!isLt2M) {
    Message.error('图片大小不能超过10MB')
    return
  }

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// 提交图标上传
const submitIconUpload = async () => {
  if (!imageUrl.value) {
    Message.warning('请先选择图片')
    return
  }

  if (!currentProject.value) {
    Message.error('项目信息获取失败')
    return
  }

  try {
    iconLoading.value = true

    // 创建FormData对象
    const formData = new FormData()

    // 添加项目ID
    formData.append('projectId', currentProject.value.id)
    // 添加图片文件
    formData.append('icon', fileInput.value.files[0])

    // 调用上传API
    await uploadIconService(formData)

    Message.success('图标上传成功')
    iconDialogVisible.value = false
    await fetchProjects() // 刷新数据
  } catch (error) {
    console.error('上传图标失败:', error)
  } finally {
    iconLoading.value = false
  }
}

// 取消图标上传
const cancelIconUpload = () => {
  iconDialogVisible.value = false
  imageUrl.value = ''
  currentProject.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 打开关键词编辑弹窗
const handleEditKeyword = async (row) => {
  keywordForm.id = row.id
  keywordForm.projectName = row.projectName

  try {
    // 从API获取项目的关键词数据
    const response = await getProjectKeywordListService(row.id)

    if (response.data && Array.isArray(response.data)) {
      // 将API返回的数据转换为弹窗需要的格式
      keywordForm.keywords = response.data.map(item => ({
        id: item.id,
        keyword: item.keyword,
        codeLength: item.codeLength.toString(),
        updateAt: item.updateAt
      }))
    } else {
      // 如果没有数据，初始化为空数组
      keywordForm.keywords = []
    }
  } catch (error) {
    console.error('获取关键词数据失败:', error)
    Message.error('获取关键词数据失败')
    keywordForm.keywords = []
  }

  keywordDialogVisible.value = true

  // 下一帧后重置表单校验结果
  nextTick(() => {
    keywordFormRef.value?.resetFields()
    keywordFormRef.value?.clearValidate()
    newKeywordRef.value?.resetFields()
    newKeywordRef.value?.clearValidate()
  })
}

// 取消关键词编辑
const cancelKeywordEdit = () => {
  keywordDialogVisible.value = false
  keywordForm.id = ''
  keywordForm.projectName = ''
  keywordForm.keywords = []
  // 重置新增关键词表单
  newKeyword.keyword = ''
  newKeyword.codeLength = ''
}

// 添加新关键词
const addNewKeyword = async () => {
  // if (!newKeywordRef.value) return

  try {
    // 检查关键词是否已存在
    const exists = keywordForm.keywords.some(item => item.keyword === newKeyword.keyword)
    if (exists) {
      Message.warning('关键词已存在')
      return
    }

    // 调用API添加关键词
    const projectData = {
      projectId: keywordForm.id,
      keyword: newKeyword.keyword,
      codeLength: Number(newKeyword.codeLength)
    }
    await setProjectKeywordService(projectData)

    // 重新获取关键词列表
    const response = await getProjectKeywordListService(keywordForm.id)
    if (response.data && Array.isArray(response.data)) {
      keywordForm.keywords = response.data.map(item => ({
        id: item.id,
        keyword: item.keyword,
        codeLength: item.codeLength.toString(),
        updateAt: item.updateAt
      }))
    }

    // 重置表单
    newKeyword.keyword = ''
    newKeyword.codeLength = ''
    newKeywordRef.value?.resetFields()

    Message.success('关键词添加成功')
  } catch (error) {
    console.error('添加关键词失败:', error)
    if (error.message && !error.message.includes('验证未通过')) {
      Message.error('添加关键词失败: ' + error.message)
    }
  }
}

// 删除关键词
const removeKeyword = async (index) => {
  const keywordItem = keywordForm.keywords[index]

  try {
    await ElMessageBox.confirm('确定要删除该关键词吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const projectIds = [keywordItem.id]

    // 调用API删除关键词
    await deleteProjectKeywordService(projectIds)

    // 重新获取关键词列表
    const response = await getProjectKeywordListService(keywordForm.id)
    if (response.data && Array.isArray(response.data)) {
      keywordForm.keywords = response.data.map(item => ({
        id: item.id,
        keyword: item.keyword,
        codeLength: item.codeLength.toString(),
        updateAt: item.updateAt
      }))
    }

    Message.success('关键词删除成功')
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel' && !error.toString().includes('cancel')) {
      console.error('删除关键词失败:', error)
      Message.error('删除关键词失败：' + (error.message || '未知错误'))
    }
  }
}

// 编辑关键词
const editKeywordItem = async (index, field, value) => {
  const keywordItem = keywordForm.keywords[index]

  // 如果值没有变化，不需要更新
  if (keywordItem[field] === value) {
    return
  }

  try {
    // 准备更新数据
    const updateData = {
      keywordId: keywordItem.id,
      [field]: field === 'codeLength' ? Number(value) : value
    }

    // 调用API更新关键词
    await editProjectKeywordService(updateData)

    // 更新本地数据
    keywordForm.keywords[index][field] = value

    Message.success('关键词更新成功')
  } catch (error) {
    console.error('更新关键词失败:', error)
    Message.error('更新关键词失败: ' + (error.message || '未知错误'))

    // 重新获取数据以恢复原始值
    try {
      const response = await getProjectKeywordListService(keywordForm.id)
      if (response.data && Array.isArray(response.data)) {
        keywordForm.keywords = response.data.map(item => ({
          id: item.id,
          keyword: item.keyword,
          codeLength: item.codeLength.toString(),
          updateAt: item.updateAt
        }))
      }
    } catch (refreshError) {
      console.error('刷新数据失败:', refreshError)
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
    expirationTime: item.expirationTime,
    icon: item.icon || '',
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

// 处理下拉框命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row.id)
      break
    case 'uploadIcon':
      uploadIcon(row)
      break
    case 'keyword':
      handleEditKeyword(row)
      break
    default:
      break
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
        <el-table-column prop="projectName" label="项目名称" width="150" align="center">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center ;font-weight: bold">
              <img v-if="scope.row.icon" :src="scope.row.icon"
                   style="width: 25px; margin-right: 5px; border-radius: 4px;" alt="图标"/>
              <span style="font-weight: bold;font-size: 16px">{{ scope.row.projectName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="项目价格" width="120" align="center">
          <template #default="scope">
            <span v-if="scope.row.hasPrice" class="price">￥{{ scope.row.price.toFixed(2) }}</span>
            <span v-else class="no-price">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="expirationTime" label="设置过期时间" min-width="160" align="center">
          <template #default="scope">
            <span class="expiration-time">{{ scope.row.expirationTime }}分钟</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" align="center"/>
        <el-table-column prop="updateAt" label="更新时间" min-width="180" align="center"/>

        <el-table-column label="操作" fixed="right" width="120" align="center">
          <template #default="scope">
            <el-dropdown
                @command="(command) => handleCommand(command, scope.row)"
                size="large"
            >
              <el-button type="primary" size="small">
                操作
                <el-icon class="el-icon--right">
                  <ArrowDown/>
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="keyword">
                    <el-icon>
                      <Postcard/>
                    </el-icon>
                    关键词
                  </el-dropdown-item>
                  <el-dropdown-item command="edit">
                    <el-icon>
                      <Edit/>
                    </el-icon>
                    修改
                  </el-dropdown-item>
                  <el-dropdown-item command="uploadIcon">
                    <el-icon>
                      <Upload/>
                    </el-icon>
                    上传图标
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon>
                      <Delete/>
                    </el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
        <el-form-item v-if="dialogMode === 'edit'" label="过期时间" prop="expirationTime">
          <el-input
              v-model="projectForm.expirationTime"
              placeholder="最少15分钟，最多1440分钟"
              type="number"
              :min="15"
              :max="1440"
              class="expiration-input"
          >
            <template #suffix>分钟</template>
          </el-input>
          <div class="form-tip">
            <span class="tip-text">建议设置范围：15-1440分钟（24小时内）</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelProject">取消</el-button>
          <el-button type="primary" @click="submitProject" :loading="projectLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图标上传弹窗 -->
    <el-dialog
        v-model="iconDialogVisible"
        title="上传项目图标"
        width="400px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @closed="cancelIconUpload"
    >
      <div class="icon-upload-container">
        <div class="project-info" v-if="currentProject">
          <span class="project-name">{{ currentProject.projectName }}</span>
        </div>

        <div class="icon-preview">
          <img v-if="imageUrl" :src="imageUrl" class="preview-image" alt="图标预览"/>
          <div v-else class="empty-preview">
            <i class="el-icon-picture-outline"></i>
            <span>暂无图片</span>
          </div>
        </div>

        <div class="upload-actions">
          <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
          />
          <el-button type="primary" @click="handleSelectFile">选择图片</el-button>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelIconUpload">取消</el-button>
          <el-button type="primary" @click="submitIconUpload" :loading="iconLoading">上传</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 关键词编辑弹窗 -->
    <el-dialog
        v-model="keywordDialogVisible"
        title="编辑关键词"
        width="650px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @closed="cancelKeywordEdit"
        class="compact-keyword-dialog"
        :modal-append-to-body="false"
        :append-to-body="true"
        top="5vh"
    >
      <div class="keyword-info">
        <div class="info-item">
          <span class="label">项目名称:</span>
          <span class="value">{{ keywordForm.projectName }}</span>
        </div>
      </div>

      <!-- 已有关键词列表 -->
      <div class="keyword-list-section" v-if="keywordForm.keywords.length > 0">
        <div class="section-header">
          <h4 class="section-title">已添加的关键词</h4>
          <el-tag type="primary" size="small">{{ keywordForm.keywords.length }} 个</el-tag>
        </div>
        <div class="keyword-scroll-container">
          <div class="keyword-list">
            <div
                v-for="(item, index) in keywordForm.keywords"
                :key="item.id"
                class="keyword-item-card"
            >
              <div class="keyword-index">{{ index + 1 }}</div>
              <div class="keyword-content">
                <div class="keyword-row">
                  <div class="keyword-field">
                    <label class="field-label">关键词</label>
                    <el-input
                        v-model="item.keyword"
                        size="small"
                        placeholder="请输入关键词"
                        @blur="editKeywordItem(index, 'keyword', item.keyword)"
                        class="field-input"
                        style="width: 240px;"
                    />
                  </div>
                  <div class="keyword-field">
                    <label class="field-label">验证码位数</label>
                    <el-input
                        v-model="item.codeLength"
                        size="small"
                        placeholder="位数"
                        @blur="editKeywordItem(index, 'codeLength', item.codeLength)"
                        class="field-input-short"
                        style="width: 80px;"
                    />
                  </div>
                </div>
                <div class="keyword-meta">
                  <div class="keyword-time">
                    <el-icon class="time-icon">
                      <Clock/>
                    </el-icon>
                    <span class="time-text">{{ DateFormatter.format(item.updateAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="keyword-actions">
                <el-button
                    type="danger"
                    size="small"
                    @click="removeKeyword(index)"
                    class="remove-btn"
                    :icon="Delete"
                    circle
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else class="empty-keywords">
        <div class="empty-content">
          <el-icon class="empty-icon">
            <Postcard/>
          </el-icon>
          <h4 class="empty-title">暂无关键词</h4>
          <p class="empty-description">该项目还没有添加任何关键词，请在下方添加新的关键词</p>
        </div>
      </div>

      <!-- 添加新关键词 -->
      <div class="add-keyword-section">
        <h4 class="section-title">添加新关键词</h4>
        <div class="add-form-container">
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">关键词</label>
              <el-input
                  v-model="newKeyword.keyword"
                  placeholder="请输入关键词"
                  maxlength="50"
                  show-word-limit
                  size="small"
                  class="form-input"
                  style="width: 240px;"
              />
            </div>
            <div class="form-field">
              <label class="form-label">验证码位数</label>
              <el-input
                  v-model="newKeyword.codeLength"
                  placeholder="请输入验证码位数"
                  maxlength="2"
                  size="small"
                  class="form-input-short"
                  style="width: 120px;"
              />
            </div>
            <div class="form-field-btn">
              <el-button type="primary" @click="addNewKeyword" size="small">添加关键词</el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelKeywordEdit">取消</el-button>
          <el-button type="primary" @click="cancelKeywordEdit">完成</el-button>
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

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
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

/* 过期时间输入框样式 */
.expiration-input :deep(.el-input__suffix) {
  color: #606266;
  font-weight: 500;
  font-size: 13px;
}

.form-tip {
  margin-top: 4px;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 图标上传相关样式 */
.icon-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.project-info {
  margin-bottom: 15px;
  text-align: center;
}

.project-name {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.icon-preview {
  width: 150px;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.expiration-time{
 font-weight: bold;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.empty-preview i {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-actions {
  margin-top: 10px;
}

.keyword-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  color: #606266;
  margin-right: 10px;
  display: inline-block;
  width: 80px;
}

.value {
  color: #303133;
}

.keyword-tip i {
  margin-right: 5px;
  font-size: 14px;
}

.keyword-list-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.keyword-scroll-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}

.keyword-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.keyword-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.keyword-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.keyword-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.keyword-list {
  margin-bottom: 0;
}

.keyword-item-card {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.keyword-item-card:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #0ea5e9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
}

.keyword-item-card:last-child {
  margin-bottom: 0;
}

.keyword-index {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  margin-right: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.keyword-content {
  flex: 1;
  min-width: 0;
}

.keyword-row {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.keyword-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-weight: 500;
  color: #374151;
  font-size: 12px;
  margin: 0;
}

.field-input {
  width: 180px;
}

.field-input-short {
  width: 100px;
}

.keyword-meta {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.keyword-time {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.time-icon {
  margin-right: 4px;
  font-size: 12px;
  color: #64748b;
}

.time-text {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

.keyword-actions {
  margin-left: 16px;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.remove-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.remove-btn:hover {
  background: #fecaca;
  border-color: #f87171;
  color: #b91c1c;
  transform: scale(1.05);
}

.add-keyword-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #fafbfc;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}

.add-keyword-section .section-title {
  margin-bottom: 15px;
  border-bottom: none;
  padding-bottom: 0;
}

.empty-keywords {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  margin-bottom: 20px;
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-title {
  color: #475569;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-description {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .keyword-scroll-container {
    max-height: 250px;
  }

  .keyword-item-card {
    padding: 12px;
    margin-bottom: 8px;
  }

  .keyword-row {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }

  .keyword-field {
    width: 100%;
  }

  .field-input,
  .field-input-short {
    width: 100%;
  }

  .keyword-index {
    width: 24px;
    height: 24px;
    font-size: 12px;
    margin-right: 12px;
  }

  .keyword-actions {
    margin-left: 12px;
  }

  .remove-btn {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .keyword-scroll-container {
    max-height: 200px;
  }

  .keyword-item-card {
    flex-direction: column;
    align-items: stretch;
  }

  .keyword-index {
    align-self: flex-start;
    margin-bottom: 8px;
    margin-right: 0;
  }

  .keyword-actions {
    margin-left: 0;
    margin-top: 8px;
    justify-content: flex-end;
  }
}

.compact-keyword-dialog .keyword-info {
  margin-bottom: 12px;
  padding: 10px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.compact-keyword-dialog .keyword-info .info-item {
  margin-bottom: 0;
  font-size: 13px;
  line-height: 1.4;
}

.compact-keyword-dialog .section-header {
  margin-bottom: 8px;
}

.compact-keyword-dialog .section-title {
  font-size: 14px;
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.compact-keyword-dialog .keyword-list-section {
  margin-bottom: 12px;
}

.compact-keyword-dialog .keyword-scroll-container {
  max-height: 200px;
}

.compact-keyword-dialog .keyword-item-card {
  padding: 10px 12px;
  margin-bottom: 8px;
}

.compact-keyword-dialog .keyword-row {
  margin-bottom: 4px;
  gap: 16px;
}

.compact-keyword-dialog .keyword-meta {
  margin-top: 2px;
}

.compact-keyword-dialog .keyword-time {
  padding: 2px 6px;
}

.compact-keyword-dialog .time-text {
  font-size: 10px;
}

.compact-keyword-dialog .keyword-index {
  width: 24px;
  height: 24px;
  font-size: 12px;
  margin-right: 12px;
}

.compact-keyword-dialog .remove-btn {
  width: 24px;
  height: 24px;
}

.compact-keyword-dialog .add-keyword-section {
  margin-top: 12px;
  padding: 12px;
  background-color: #fafbfc;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}

.compact-keyword-dialog .add-keyword-section .section-title {
  margin-bottom: 8px;
  font-size: 14px;
}

.compact-keyword-dialog .form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}


.compact-keyword-dialog .empty-keywords {
  padding: 20px 15px;
  margin-bottom: 12px;
}

.compact-keyword-dialog .empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.compact-keyword-dialog .empty-title {
  font-size: 14px;
  margin: 0 0 4px 0;
}

.compact-keyword-dialog .empty-description {
  font-size: 12px;
}

.compact-keyword-dialog .dialog-footer {
  padding: 12px 0 0;
  margin-top: 12px;
}

.compact-keyword-dialog .field-input {
  width: 200px;
}

.compact-keyword-dialog .field-input-short {
  width: 100px;
}

.compact-keyword-dialog .keyword-row {
  margin-bottom: 4px;
  gap: 20px;
}

.compact-keyword-dialog .keyword-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compact-keyword-dialog .field-label {
  font-weight: 500;
  color: #374151;
  font-size: 12px;
  margin: 0;
}

.compact-keyword-dialog .add-form-container {
  margin-top: 8px;
}

.compact-keyword-dialog .form-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.compact-keyword-dialog .form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compact-keyword-dialog .form-label {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  margin: 0;
}

.compact-keyword-dialog .form-input {
  width: 200px;
}

.compact-keyword-dialog .form-input-short {
  width: 120px;
}

.compact-keyword-dialog .form-field-btn {
  margin-top: 16px;
}
</style>