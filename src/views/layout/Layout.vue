<script setup>
// 布局组件
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '../../components/HeaderBar.vue'
import SideMenu from '../../components/SideMenu.vue'

const route = useRoute()
const currentMenu = ref('账单管理')
const activeMenu = ref('1')

// 使用computed优化标题计算
const title = computed(() => '管理后台 — ' + currentMenu.value)

// 菜单路径映射表
const menuPathMap = {
  '/': { id: '1', name: '账单管理' },
  '/announcement': { id: '2', name: '公共栏管理' },
  '/customer': { id: '3', name: '客户管理' },
  '/merchant': { id: '4', name: '卡商管理' },
  '/phone': { id: '5', name: '号码管理' },
  '/project': { id: '6', name: '项目管理' },
  '/region': { id: '7', name: '地区管理' },
  '/order': { id: '8', name: '订单管理' },
  '/material': { id: '9', name: '资料管理' },
}

// 优化路由监听逻辑
watch(
  () => route.path,
  (newPath) => {
    const menuInfo = menuPathMap[newPath]
    if (menuInfo) {
      activeMenu.value = menuInfo.id
      currentMenu.value = menuInfo.name
    } else {
      // 如果没有匹配到路径，默认设置为账单管理
      activeMenu.value = '1'
      currentMenu.value = '账单管理'
    }
  },
  { immediate: true }
)

// 处理菜单变化
const handleMenuChange = (menuName) => {
  if (menuName) {
    currentMenu.value = menuName
  }
}
</script>

<template>
  <div class="layout-container">
    <el-container class="main-layout">
      <!-- 顶部标题栏 -->
      <el-header height="50px" class="top-header">
        <HeaderBar :title="title" />
      </el-header>
      
      <!-- 内容区域 -->
      <el-container class="content-layout">
        <!-- 左侧菜单栏 -->
        <el-aside width="230px" class="side-panel">
          <SideMenu 
            :active-menu="activeMenu" 
            @menu-change="handleMenuChange"
          />
        </el-aside>
        
        <!-- 右侧内容区域 -->
        <el-main class="main-content">
          <!-- 动画背景层 -->
          <div class="content-animation-layer">
            <div class="content-wave content-wave1"></div>
            <div class="content-wave content-wave2"></div>
            <div class="content-wave content-wave3"></div>
            <div class="content-particles">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  will-change: transform;
}

.main-layout {
  height: 100vh;
  flex-direction: column;
}

.top-header {
  padding: 0;
  width: 100%;
  will-change: transform;
}

.content-layout {
  height: calc(100vh - 50px);
}

.side-panel {
  padding: 0;
  height: 100%;
  width: 230px !important;
  will-change: transform;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 右侧内容区域样式 */
.main-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  will-change: transform;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f1f3f4 100%);
  position: relative;
}

/* 动画背景层 */
.content-animation-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* 波纹效果 - 适配浅色主题 */
.content-wave {
  position: absolute;
  width: 300%;
  height: 300%;
  top: -100%;
  left: -100%;
  background: radial-gradient(ellipse at center, transparent, transparent 40%, rgba(99, 102, 241, 0.06) 40%, transparent 41%);
  animation: content-wave-animation 20s linear infinite;
  opacity: 0.8;
}

.content-wave1 {
  animation-duration: 25s;
  background: radial-gradient(ellipse at center, transparent, transparent 35%, rgba(34, 197, 94, 0.04) 35%, transparent 36%);
}

.content-wave2 {
  animation-duration: 30s;
  animation-delay: -8s;
  background: radial-gradient(ellipse at center, transparent, transparent 38%, rgba(59, 130, 246, 0.05) 38%, transparent 39%);
}

.content-wave3 {
  animation-duration: 35s;
  animation-delay: -15s;
  background: radial-gradient(ellipse at center, transparent, transparent 42%, rgba(168, 85, 247, 0.03) 42%, transparent 43%);
}

@keyframes content-wave-animation {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.05);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* 粒子效果 - 适配浅色主题 */
.content-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.content-particles span {
  position: absolute;
  display: block;
  width: 3px;
  height: 3px;
  background: linear-gradient(45deg, rgba(99, 102, 241, 0.6), rgba(59, 130, 246, 0.4));
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
  opacity: 0;
  animation: content-particle-float 12s linear infinite;
}

.content-particles span:nth-child(1) {
  left: 15%;
  animation-delay: 0s;
  animation-duration: 10s;
  background: linear-gradient(45deg, rgba(34, 197, 94, 0.6), rgba(16, 185, 129, 0.4));
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
}

.content-particles span:nth-child(2) {
  left: 25%;
  animation-delay: 2s;
  animation-duration: 14s;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.6), rgba(99, 102, 241, 0.4));
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

.content-particles span:nth-child(3) {
  left: 40%;
  animation-delay: 4s;
  animation-duration: 11s;
  background: linear-gradient(45deg, rgba(168, 85, 247, 0.6), rgba(147, 51, 234, 0.4));
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.3);
}

.content-particles span:nth-child(4) {
  left: 60%;
  animation-delay: 6s;
  animation-duration: 13s;
  background: linear-gradient(45deg, rgba(244, 63, 94, 0.5), rgba(239, 68, 68, 0.3));
  box-shadow: 0 0 8px rgba(244, 63, 94, 0.3);
}

.content-particles span:nth-child(5) {
  left: 75%;
  animation-delay: 8s;
  animation-duration: 12s;
  background: linear-gradient(45deg, rgba(245, 158, 11, 0.5), rgba(251, 191, 36, 0.3));
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.content-particles span:nth-child(6) {
  left: 85%;
  animation-delay: 10s;
  animation-duration: 15s;
  background: linear-gradient(45deg, rgba(14, 165, 233, 0.6), rgba(2, 132, 199, 0.4));
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.3);
}

.content-particles span:nth-child(7) {
  left: 30%;
  animation-delay: 12s;
  animation-duration: 9s;
  background: linear-gradient(45deg, rgba(16, 185, 129, 0.6), rgba(5, 150, 105, 0.4));
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

@keyframes content-particle-float {
  0% {
    bottom: -10px;
    opacity: 0;
    transform: translateX(0) scale(0.5);
  }
  10% {
    opacity: 1;
    transform: translateX(10px) scale(1);
  }
  90% {
    opacity: 1;
    transform: translateX(50px) scale(1);
  }
  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(80px) scale(0.3);
  }
}

/* 确保内容在动画背景之上 */
.main-content > *:not(.content-animation-layer) {
  position: relative;
  z-index: 1;
}

</style>