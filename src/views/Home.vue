<script setup>
// 公共栏管理组件
import { ref } from 'vue'

const announcement = ref('')

const saveAnnouncement = () => {
  // 保存公告信息
  console.log('保存公告:', announcement.value)
  // TODO: 添加保存公告的API调用
}
</script>

<template>
  <div class="management-container">
    <div class="content-area">
      <div class="input-container">
        <el-input
          v-model="announcement"
          type="textarea"
          :rows="8"
          placeholder="请输入内容到公告栏"
        />
      </div>
      <div class="button-container">
        <el-button type="primary" class="save-button" @click="saveAnnouncement">保存</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.management-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.content-area {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  width: 90%;
  max-width: 800px;
}

.input-container {
  width: 100%;
  margin-bottom: 20px;
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
  border-radius: 4px;
}

:deep(.el-textarea__inner) {
  resize: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  min-height: 175px;
  background-color: #ffffff;
}
</style> 