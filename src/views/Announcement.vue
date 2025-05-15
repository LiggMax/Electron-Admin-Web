<script setup>
// 公共栏管理组件
import { ref, computed, onMounted } from 'vue'
import { publishAnnouncement, getAnnouncementList } from "../api/announcement.js"
import ElMessage from '../utils/message.js'
import DateFormatter from '../utils/DateFormatter.js'

const announcement = ref('')
const announcementList = ref([])
const loading = ref(false)

// 计算剩余字符数
const remainingChars = computed(() => {
  return 100 - announcement.value.length
})

// 检查字符数是否有效
const isValidLength = computed(() => {
  const length = announcement.value.trim().length
  return length >= 5 && length <= 100
})

// 保存公告
const saveAnnouncement = async () => {
  try {
    const content = announcement.value.trim()
    await publishAnnouncement(content)
    ElMessage.success('公告发布成功')
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
      // 处理数据，格式化日期
      announcementList.value = response.data.map(item => ({
        id: item.id,
        content: item.content,
        createTime: DateFormatter.format(item.createTime)
      }))
  } finally {
    loading.value = false
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
      <div class="button-container">
        <el-button 
          type="primary" 
          class="save-button" 
          @click="saveAnnouncement"
          :disabled="!isValidLength"
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
        <el-table-column prop="content" label="公告内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />
      </el-table>
      
      <div v-if="!loading && announcementList.length === 0" class="empty-data">
        暂无公告
      </div>
    </div>
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
</style> 