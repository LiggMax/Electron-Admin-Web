<script setup>
// 公共栏管理组件
import { ref, computed } from 'vue'
import { publishAnnouncement } from "../api/announcement.js"
import ElMessage from '../utils/message.js'

const announcement = ref('')

// 计算剩余字符数
const remainingChars = computed(() => {
  return 100 - announcement.value.length
})

// 检查字符数是否有效
const isValidLength = computed(() => {
  const length = announcement.value.trim().length
  return length >= 5 && length <= 100
})

const saveAnnouncement = async () => {
  const content = announcement.value.trim()
    await publishAnnouncement(content)
    ElMessage.success('公告发布成功')
    announcement.value = ''
}
</script>

<template>
  <div class="management-container">
    <div class="content-area">
      <div class="input-container">
        <el-input
          v-model="announcement"
          type="textarea"
          :rows="5"
          placeholder="请输入内容输入框"
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
        >保存</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.management-container {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.content-area {
  background-color: #fff;
  border-radius: 14px;
  padding: 20px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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
</style> 