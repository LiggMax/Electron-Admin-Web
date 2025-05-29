<script setup>
// 布局组件
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '../../components/HeaderBar.vue'
import SideMenu from '../../components/SideMenu.vue'

const route = useRoute()
const currentMenu = ref('公共栏管理')
const activeMenu = ref('1')

// 使用computed优化标题计算
const title = computed(() => '管理后台 — ' + currentMenu.value)

// 菜单路径映射表
const menuPathMap = {
  '/': { id: '1', name: '公共栏管理' },
  '/customer': { id: '2', name: '客户管理' },
  '/merchant': { id: '3', name: '卡商管理' },
  '/phone': { id: '4', name: '号码管理' },
  '/project': { id: '5', name: '项目管理' },
  '/region': { id: '6', name: '地区管理' },
  '/order': { id: '7', name: '订单管理' },
  '/material': { id: '8', name: '资料管理' },
}

// 优化路由监听逻辑
watch(
  () => route.path,
  (newPath) => {
    const menuInfo = menuPathMap[newPath]
    if (menuInfo) {
      activeMenu.value = menuInfo.id
      currentMenu.value = menuInfo.name
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
  background-color: #4D4D4D;
  will-change: transform;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 右侧内容区域样式 */
.main-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  will-change: transform;
}

:deep(.el-aside) {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 230px !important;
}

:deep(.el-container) {
  height: 100%;
}
</style>