<script setup>
import { computed } from 'vue'
import { User, Notification, Bell } from '@element-plus/icons-vue'

// 定义props
const props = defineProps({
  title: {
    type: String,
    default: '管理后台'
  }
})

// 计算完整标题
const fullTitle = computed(() => {
  // 简化标题，只显示"管理后台 — 公共栏管理"这样的格式
  if (props.title.includes('—')) {
    return props.title;
  }
  return props.title;
})

// 获取当前时间
const currentTime = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <div class="top-header">
    <div class="header-left">
      <div class="title-container">
        <span class="title-text">{{ fullTitle }}</span>
      </div>
    </div>
    
    <div class="header-right">
      <div class="time-display">
        <el-icon class="time-icon"><Bell /></el-icon>
        <span class="time-text">{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 顶部标题栏样式 */
.top-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%);
  color: #fff;
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.top-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="header-pattern" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="5" cy="25" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23header-pattern)"/></svg>');
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-left: 15px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.time-display:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.time-icon {
  font-size: 14px;
  opacity: 0.8;
}

.time-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
}

.notification-btn {
  position: relative;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px) scale(1.05);
}

.notification-btn .el-icon {
  font-size: 16px;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #FF4757;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .top-header {
    padding: 0 15px;
  }
  
  .header-right {
    gap: 15px;
  }
  
  .time-display {
    padding: 6px 10px;
  }
  
  .time-text {
    font-size: 11px;
  }
  
  .title-text {
    font-size: 16px;
  }
}

@media screen and (max-width: 768px) {
  .top-header {
    padding: 0 12px;
  }
  
  .header-right {
    gap: 12px;
  }
  
  .time-display {
    display: none;
  }
  
  .title-text {
    font-size: 15px;
  }
  
  .title-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
  
  .user-name {
    display: none;
  }
  
  .user-info {
    padding: 6px;
    gap: 0;
  }
}

@media screen and (max-width: 480px) {
  .top-header {
    padding: 0 10px;
  }
  
  .header-right {
    gap: 8px;
  }
  
  .title-text {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }
  
  .title-container {
    gap: 8px;
  }
  
  .title-icon {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
  
  .notification-btn {
    width: 32px;
    height: 32px;
  }
  
  .user-avatar {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}
</style> 