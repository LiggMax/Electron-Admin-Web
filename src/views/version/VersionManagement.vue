<template>
  <div class="version-management">
    <!-- 上传区域 -->
    <el-card class="upload-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Upload /></el-icon>
          <span>应用版本上传</span>
        </div>
      </template>
      
      <div class="upload-content">
        <!-- 版本信息表单 -->
        <el-form
          :model="uploadForm"
          :rules="uploadRules"
          ref="uploadFormRef"
          label-width="100px"
          class="upload-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="版本号" prop="version">
                <el-input
                  v-model="uploadForm.version"
                  placeholder="请输入版本号，如：1.0.0"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发布说明" prop="releaseNotes">
                <el-input
                  v-model="uploadForm.releaseNotes"
                  placeholder="请输入发布说明"
                  type="textarea"
                  :rows="1"
                  maxlength="100"
                  show-word-limit
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 文件上传区域 -->
        <div class="upload-area">
          <el-upload
            ref="uploadRef"
            class="upload-dragger"
            :drag="true"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="beforeUpload"
            accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.zip,.tar.gz"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .exe/.msi/.dmg/.pkg/.deb/.rpm/.zip/.tar.gz 格式，单个文件不超过1GB
                <br>
                <span style="color: #409eff;">超过10MB的文件将自动使用分片上传，确保上传稳定性</span>
              </div>
            </template>
          </el-upload>

          <!-- 上传按钮区域 -->
          <div class="upload-actions" v-if="selectedFile">
            <el-button
              type="primary"
              :loading="uploading"
              @click="startUpload"
              :disabled="!canUpload"
            >
              <el-icon><Upload /></el-icon>
              {{ uploading ? '上传中...' : '开始上传' }}
            </el-button>
            
            <el-button
              v-if="uploading && currentUploadId"
              @click="cancelUpload"
              type="danger"
            >
              <el-icon><Close /></el-icon>
              取消上传
            </el-button>
          </div>

          <!-- 上传进度 -->
          <div class="upload-progress" v-if="uploading || uploadProgress.visible">
            <div class="progress-info">
              <span class="file-name">{{ selectedFile?.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile?.size || 0) }}</span>
            </div>
            
            <el-progress
              :percentage="uploadProgress.percentage"
              :status="uploadProgress.status"
              :stroke-width="8"
              striped
              striped-flow
            >
              <template #default="{ percentage }">
                <span class="progress-text">{{ percentage }}%</span>
              </template>
            </el-progress>

            <div class="progress-details" v-if="uploadProgress.chunks">
              <span>分片进度: {{ uploadProgress.uploadedChunks }} / {{ uploadProgress.totalChunks }}</span>
              <span>上传速度: {{ uploadProgress.speed }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 版本列表 -->
    <el-card class="version-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>版本历史</span>
          <el-button
            @click="refreshVersionList"
            :loading="listLoading"
            type="primary"
            size="small"
            class="refresh-btn"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="versionList"
        :loading="listLoading"
        stripe
        height="400"
        style="width: 100%"
      >
        <el-table-column prop="version" label="版本号" width="120" />
        <el-table-column prop="releaseNotes" label="发布说明" show-overflow-tooltip />
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="downloadVersion(scope.row)"
              link
            >
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Close, Download, List, Refresh, Upload, UploadFilled} from '@element-plus/icons-vue'
import axios from 'axios'
import versionApi from '../../api/version.js'

// 表单数据
const uploadForm = reactive({
  version: '',
  releaseNotes: ''
})

// 表单验证规则
const uploadRules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式不正确，如：1.0.0', trigger: 'blur' }
  ],
  releaseNotes: [
    { required: true, message: '请输入发布说明', trigger: 'blur' },
    { min: 1, max: 100, message: '发布说明长度在1-100个字符', trigger: 'blur' }
  ]
}

// 引用
const uploadFormRef = ref()
const uploadRef = ref()

// 上传状态
const uploading = ref(false)
const selectedFile = ref(null)
const currentUploadId = ref('')

// 上传进度
const uploadProgress = reactive({
  visible: false,
  percentage: 0,
  status: '',
  chunks: false,
  uploadedChunks: 0,
  totalChunks: 0,
  speed: '0 KB/s'
})

// 版本列表
const versionList = ref([])
const listLoading = ref(false)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 计算属性
const canUpload = computed(() => {
  return selectedFile.value && uploadForm.version && uploadForm.releaseNotes && !uploading.value
})

// 文件大小格式化
const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

// 时间格式化
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 生成文件标识符
const generateFileIdentifier = (file) => {
  return `${file.name}_${file.size}_${Date.now()}`
}

// 文件选择处理
const handleFileChange = (file) => {
  selectedFile.value = file.raw
  uploadProgress.visible = false
  uploadProgress.percentage = 0
}

// 文件移除处理
const handleFileRemove = () => {
  selectedFile.value = null
  uploadProgress.visible = false
  uploadProgress.percentage = 0
}

// 上传前验证
const beforeUpload = (file) => {
  const isValidSize = file.size <= 1024 * 1024 * 1024 // 1GB
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过1GB!')
    return false
  }
  return false // 阻止自动上传
}

// 开始上传
const startUpload = async () => {
  if (!uploadFormRef.value) return
  
  try {
    await uploadFormRef.value.validate()
  } catch (error) {
    ElMessage.error('请填写完整的版本信息')
    return
  }

  if (!selectedFile.value) {
    ElMessage.error('请选择要上传的文件')
    return
  }

  uploading.value = true
  uploadProgress.visible = true
  uploadProgress.percentage = 0
  uploadProgress.status = ''

  const file = selectedFile.value
  const fileSize = file.size
  // 使用API判断是否需要分片上传
  const isLargeFile = versionApi.shouldUseChunkUpload(fileSize)

  try {
      await uploadSmallFile(file)
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(`上传失败: ${error.message || '未知错误'}`)
    uploadProgress.status = 'exception'
  } finally {
    uploading.value = false
  }
}

// 小文件上传
const uploadSmallFile = async (file) => {
  const formData = new FormData()
  formData.append('appFile', file)
  formData.append('version', uploadForm.version)
  formData.append('releaseNotes', uploadForm.releaseNotes)

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'c18c6b5d-ad89-4e9e-9e45-211832' // 替换为实际的授权key
    }
  }

  const response = await axios.post('/api/version/upload', formData, config)
  
  if (response.data.code === 200) {
    uploadProgress.percentage = 100
    uploadProgress.status = 'success'
    ElMessage.success('文件上传成功!')
    resetUploadForm()
    await refreshVersionList()
  } else {
    throw new Error(response.data.message || '上传失败')
  }
}

// 大文件分片上传
const uploadLargeFile = async (file) => {
  const chunkSize = 5 * 1024 * 1024 // 5MB per chunk
  const totalChunks = Math.ceil(file.size / chunkSize)
  const identifier = generateFileIdentifier(file)
  
  currentUploadId.value = identifier
  uploadProgress.chunks = true
  uploadProgress.totalChunks = totalChunks
  uploadProgress.uploadedChunks = 0

  const startTime = Date.now()

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkNumber', i.toString())
    formData.append('totalChunks', totalChunks.toString())
    formData.append('chunkSize', chunkSize.toString())
    formData.append('totalSize', file.size.toString())
    formData.append('identifier', identifier)
    formData.append('filename', file.name)
    formData.append('version', uploadForm.version)
    formData.append('releaseNotes', uploadForm.releaseNotes)

    try {
      const response = await axios.post('/api/version/chunk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'c18c6b5d-ad89-4e9e-9e45-211832' // 替换为实际的授权key
        }
      })

      if (response.data.code === 200) {
        uploadProgress.uploadedChunks = i + 1
        uploadProgress.percentage = Math.round((uploadProgress.uploadedChunks / totalChunks) * 100)
        
        // 计算上传速度
        const elapsedTime = (Date.now() - startTime) / 1000
        const uploadedBytes = (i + 1) * chunkSize
        const speed = uploadedBytes / elapsedTime
        uploadProgress.speed = formatFileSize(speed) + '/s'

        const result = response.data.data
        if (result.completed) {
          uploadProgress.percentage = 100
          uploadProgress.status = 'success'
          ElMessage.success('文件上传成功!')
          resetUploadForm()
          await refreshVersionList()
          break
        }
      } else {
        throw new Error(response.data.message || `分片${i + 1}上传失败`)
      }
    } catch (error) {
      throw new Error(`分片${i + 1}上传失败: ${error.message}`)
    }
  }
}

// 取消上传
const cancelUpload = async () => {
  if (!currentUploadId.value) return

  try {
    await ElMessageBox.confirm('确定要取消上传吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await axios.delete(`/api/version/cancel-upload/${currentUploadId.value}`, {
      headers: {
        'Authorization': 'c18c6b5d-ad89-4e9e-9e45-211832' // 替换为实际的授权key
      }
    })

    uploading.value = false
    uploadProgress.visible = false
    uploadProgress.percentage = 0
    currentUploadId.value = ''
    ElMessage.info('上传已取消')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消上传失败:', error)
      ElMessage.error('取消上传失败')
    }
  }
}

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.version = ''
  uploadForm.releaseNotes = ''
  selectedFile.value = null
  currentUploadId.value = ''
  uploadProgress.visible = false
  uploadProgress.percentage = 0
  uploadProgress.chunks = false
  uploadProgress.uploadedChunks = 0
  uploadProgress.totalChunks = 0
  uploadProgress.speed = '0 KB/s'
  uploadRef.value?.clearFiles()
}

// 刷新版本列表
const refreshVersionList = async () => {
  listLoading.value = true
  try {
    const response = await axios.get('/api/version/list', {
      params: {
        page: pagination.page,
        size: pagination.size
      },
      headers: {
        'Authorization': 'c18c6b5d-ad89-4e9e-9e45-211832' // 替换为实际的授权key
      }
    })

    if (response.data.code === 200) {
      const data = response.data.data
      versionList.value = data.list || []
      pagination.total = data.total || 0
    } else {
      throw new Error(response.data.message || '获取版本列表失败')
    }
  } catch (error) {
    console.error('获取版本列表失败:', error)
    ElMessage.error('获取版本列表失败')
  } finally {
    listLoading.value = false
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  refreshVersionList()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page
  refreshVersionList()
}

// 下载版本
const downloadVersion = (version) => {
  if (version.downloadUrl) {
    window.open(version.downloadUrl, '_blank')
  } else {
    ElMessage.error('下载链接不存在')
  }
}

// 页面加载时获取版本列表
onMounted(() => {
  refreshVersionList()
})
</script>

<style scoped>
.version-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-card,
.version-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.refresh-btn {
  margin-left: auto;
}

.upload-content {
  padding: 20px 0;
}

.upload-form {
  margin-bottom: 30px;
}

.upload-area {
  text-align: center;
}

.upload-dragger {
  width: 100%;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.upload-progress {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.file-name {
  font-weight: 600;
  color: #333;
}

.file-size {
  color: #666;
  font-size: 14px;
}

.progress-text {
  font-weight: 600;
  color: #409eff;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .version-management {
    padding: 10px;
  }
  
  .upload-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .progress-info,
  .progress-details {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 