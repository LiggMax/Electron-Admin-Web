<script setup>
// 布局组件
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '../components/HeaderBar.vue'
import SideMenu from '../components/SideMenu.vue'

const route = useRoute()
const currentMenu = ref('公共栏管理')
const activeMenu = ref('1')

// 监听路由变化，更新菜单选中状态
watch(() => route.path, (newPath) => {
  // 根据路径设置当前活动菜单
  switch(newPath) {
    case '/':
      activeMenu.value = '1'
      currentMenu.value = '公共栏管理'
      break
    case '/customer':
      activeMenu.value = '2'
      currentMenu.value = '客户管理'
      break
    case '/merchant':
      activeMenu.value = '3'
      currentMenu.value = '卡商管理'
      break
    case '/phone':
      activeMenu.value = '4'
      currentMenu.value = '号码管理'
      break
    case '/project':
      activeMenu.value = '5'
      currentMenu.value = '项目管理'
      break
    case '/material':
      activeMenu.value = '6'
      currentMenu.value = '资料管理'
      break
  }
}, { immediate: true })

// 处理菜单变化
const handleMenuChange = (menuName) => {
  currentMenu.value = menuName
}

// 获取标题
const getTitle = () => {
  return '管理后台 — ' + currentMenu.value
}
</script>

<template>
  <div class="layout-container">
    <el-container class="main-layout">
      <!-- 顶部标题栏 -->
      <el-header height="50px" class="top-header">
        <HeaderBar :title="getTitle()" />
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
          <router-view />
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
}

.main-layout {
  height: 100vh;
  flex-direction: column;
}

.top-header {
  padding: 0;
  width: 100%;
}

.content-layout {
  height: calc(100vh - 50px);
}

.side-panel {
  padding: 0;
  height: 100%;
  width: 230px !important;
  background-color: #4D4D4D;
}

/* 右侧内容区域样式 */
.main-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

:deep(.el-aside) {
  transition: width 0.3s;
  width: 230px !important;
}

:deep(.el-container) {
  height: 100%;
}
</style> 