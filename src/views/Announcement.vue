<script setup>
// 公共栏管理组件
import { ref, computed, onMounted } from 'vue'
import {Announcement, getAnnouncementList, deleteAnnouncementService} from "../api/announcement.js"
import ElMessage from '../utils/message.js'
import DateFormatter from '../utils/DateFormatter.js'
import { Delete, Edit } from '@element-plus/icons-vue'

const announcement = ref('')
const announcementTitle = ref('')
const announcementList = ref([])
const loading = ref(false)
const editDialogVisible = ref(false)
const editForm = ref({
  id: null,
  content: '',
  title: ''
})
const editLoading = ref(false)

// 计算剩余字符数
const remainingChars = computed(() => {
  return 100 - announcement.value.length
})

// 编辑框剩余字符数
const editRemainingChars = computed(() => {
  return 100 - (editForm.value.content?.length || 0)
})

// 检查字符数是否有效
const isValidLength = computed(() => {
  const length = announcement.value.trim().length
  return length >= 5 && length <= 100
})

// 检查标题是否有效
const isValidTitle = computed(() => {
  const length = announcementTitle.value.trim().length
  return length > 0 && length <= 30
})

// 检查是否可以发布
const canPublish = computed(() => {
  return isValidLength.value && isValidTitle.value
})

// 检查编辑内容是否有效
const isEditContentValid = computed(() => {
  const length = editForm.value.content?.trim().length || 0
  return length >= 5 && length <= 100
})

// 检查编辑标题是否有效
const isEditTitleValid = computed(() => {
  const length = editForm.value.title?.trim().length || 0
  return length > 0 && length <= 30
})

// 检查是否可以提交编辑
const canSubmitEdit = computed(() => {
  return isEditContentValid.value && isEditTitleValid.value
})

// 保存公告
const saveAnnouncement = async () => {
  if (!canPublish.value) {
    if (!isValidTitle.value) {
      ElMessage.warning('标题长度应在1-30个字符之间')
    } else {
      ElMessage.warning('公告内容长度应在5-100个字符之间')
    }
    return
  }

  try {
    const data = {
      title: announcementTitle.value.trim(),
      content: announcement.value.trim()
    }
    await Announcement(data)
    ElMessage.success('公告发布成功')
    announcementTitle.value = ''
    announcement.value = ''
    await fetchAnnouncementList() // 发布成功后刷新列表
  } catch (error) {
    ElMessage.error('公告发布失败')
  }
}

// 获取公告列表
const fetchAnnouncementList = async () => {
  try {
    loading.value = true
    const response = await getAnnouncementList()
      // 处理数据
      announcementList.value = response.data.map(item => ({
        id: item.id,
        content: item.content,
        title: item.title || '',
        createTime: DateFormatter.format(item.createTime)
      }))
  } finally {
    loading.value = false
  }
}

/**
 * 编辑公告
 */
const handleEdit = (row) => {
  editForm.value = {
    id: row.id,
    content: row.content,
    title: row.title || ''
  }
  editDialogVisible.value = true
}

/**
 * 提交编辑
 */
const submitEdit = async () => {
  if (!canSubmitEdit.value) {
    if (!isEditTitleValid.value) {
      ElMessage.warning('标题长度应在1-30个字符之间')
    } else {
      ElMessage.warning('公告内容长度应在5-100个字符之间')
    }
    return
  }
  
  try {
    editLoading.value = true
    //构建内容
    const editFormData = {
      id: editForm.value.id,
      content: editForm.value.content.trim(),
      title: editForm.value.title.trim()
    }
    await Announcement(editFormData)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    await fetchAnnouncementList() // 更新成功后刷新列表
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

/**
 * 关闭编辑弹窗
 */
const closeEditDialog = () => {
  editDialogVisible.value = false
  editForm.value = {
    id: null,
    content: '',
    title: ''
  }
}

/**
 * 删除公告
 */
const deleteAnnouncement = async (id) => {
  try {
    await deleteAnnouncementService(id)
    ElMessage.success('删除成功')
    await fetchAnnouncementList() // 删除成功后刷新列表
  } catch (error) {
    ElMessage.error('删除失败')
  }
}
// 组件挂载时获取公告列表
onMounted(() => {
  fetchAnnouncementList()
})
</script>

<template>
  <div class="management-container">
    <!-- 发布公告区域 -->
    <div class="content-area">
      <h2 class="section-title">发布公告</h2>
      <div class="input-container">
        <div class="title-input">
          <label>标题：</label>
          <el-input
            v-model="announcementTitle"
            placeholder="请输入公告标题"
            maxlength="30"
            show-word-limit
          />
        </div>
        <div class="content-input">
          <label>内容：</label>
          <el-input
            v-model="announcement"
            type="textarea"
            :rows="5"
            placeholder="请输入公告内容"
            class="rounded-textarea"
            maxlength="100"
            show-word-limit
          />
          <div class="char-counter" :class="{ 'error': !isValidLength }">
            <span v-if="announcement.length < 5">最少还需输入 {{ 5 - announcement.length }} 个字符</span>
            <span v-else>还可输入 {{ remainingChars }} 个字符</span>
          </div>
        </div>
      </div>
      <div class="button-container">
        <el-button 
          type="primary" 
          class="save-button" 
          @click="saveAnnouncement"
          :disabled="!canPublish"
        >发布公告</el-button>
      </div>
    </div>

    <!-- 公告列表区域 -->
    <div class="content-area announcement-list-area">
      <h2 class="section-title">公告列表</h2>
      <el-table
        :data="announcementList"
        v-loading="loading"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="序号" width="80" align="center" />
        <el-table-column prop="title" label="标题" width="150" show-overflow-tooltip />
        <el-table-column prop="content" label="公告内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-popconfirm
                title="确定删除这条公告吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="deleteAnnouncement(scope.row.id)"
              >
                <template #reference>
                  <el-button type="danger" size="small" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
              <!--编辑-->
              <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="!loading && announcementList.length === 0" class="empty-data">
        暂无公告
      </div>
    </div>
    
    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑公告"
      width="500px"
      @close="closeEditDialog"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input 
            v-model="editForm.title" 
            placeholder="请输入标题" 
            maxlength="30" 
            show-word-limit
          />
          <div class="char-counter" :class="{ 'error': !isEditTitleValid }">
            <span v-if="!editForm.title?.trim()">标题不能为空</span>
            <span v-else-if="editForm.title?.length > 30">标题长度不能超过30个字符</span>
          </div>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入公告内容"
            maxlength="100"
            show-word-limit
          />
          <div class="char-counter" :class="{ 'error': !isEditContentValid }">
            <span v-if="(editForm.content?.length || 0) < 5">最少还需输入 {{ 5 - (editForm.content?.length || 0) }} 个字符</span>
            <span v-else>还可输入 {{ editRemainingChars }} 个字符</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEditDialog">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="editLoading" :disabled="!canSubmitEdit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.management-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.content-area {
  background-color: #fff;
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 600;
}

.input-container {
  width: 100%;
  margin-bottom: 20px;
}

.title-input {
  margin-bottom: 15px;
}

.title-input label,
.content-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
}

.rounded-textarea {
  width: 100%;
}

.char-counter {
  text-align: right;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.char-counter.error {
  color: #F56C6C;
}

.button-container {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.save-button {
  background-color: #6b8cff;
  border-color: #6b8cff;
  width: 100px;
  border-radius: 5px;
}

.announcement-list-area {
  margin-top: 20px;
}

.empty-data {
  text-align: center;
  color: #909399;
  padding: 30px 0;
  font-size: 14px;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

:deep(.el-textarea__inner) {
  resize: none;
  border-radius: 14px;
  border: 1px solid #dcdfe6;
  min-height: 120px;
  background-color: #ffffff;
  padding: 15px;
}

/* 修改保存按钮的颜色为浅紫色，与图片一致 */
:deep(.el-button--primary) {
  background-color: #7c7de9;
  border-color: #7c7de9;
}

:deep(.el-button--primary:hover) {
  background-color: #8e8ff0;
  border-color: #8e8ff0;
}

:deep(.el-button--primary:disabled) {
  background-color: #a0a0e3;
  border-color: #a0a0e3;
  cursor: not-allowed;
}

:deep(.el-table .cell) {
  padding: 10px;
}

/* 操作按钮样式 */
:deep(.el-button--danger),
:deep(.el-button--primary) {
  padding: 6px 12px;
  font-size: 12px;
}
</style> 