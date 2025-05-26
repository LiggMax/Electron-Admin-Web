<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义props
const props = defineProps({
  activeMenu: {
    type: String,
    default: '1'
  }
})

// 使用computed优化菜单项配置
const menuItems = computed(() => [
  { id: '1', name: '公共栏管理', icon: 'el-icon-setting', route: '/' },
  { id: '2', name: '客户管理', icon: 'el-icon-user', route: '/customer' },
  { id: '3', name: '卡商管理', icon: 'el-icon-document', route: '/merchant' },
  { id: '4', name: '号码管理', icon: 'el-icon-phone', route: '/phone' },
  { id: '5', name: '项目管理', icon: 'el-icon-coin', route: '/project' },
  { id: '6', name: '地区管理', icon: 'el-icon-location', route: '/region' },
  { id: '7', name: '资料管理', icon: 'el-icon-data', route: '/material' },
  { id: '8', name: '订单管理', icon: 'el-icon-shopping-cart', route: '/order' },
  { id: '9', name: '登出账号', icon: 'el-icon-key', route: '/logout' }
])

// 菜单点击事件
const emit = defineEmits(['menu-change'])
const handleMenuClick = (menu) => {
  if (!menu) return
  emit('menu-change', menu.name)
  
  // 如果是登出账号，需要特殊处理
  if (menu.id === '9') {
    // TODO: 实现登出逻辑
    console.log('登出账号')
    // 跳转到登录页
    router.push('/login')
    return
  }
}
</script>

<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      router
      :collapse="false"
      background-color="#4D4D4D"
      text-color="#fff"
      active-text-color="#fff"
      @select="(index) => handleMenuClick(menuItems.find(item => item.id === index))"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.id"
        :index="item.id"
        :route="item.route"
      >
        <el-icon v-if="false"><i :class="item.icon"></i></el-icon>
        <span class="menu-text">{{ item.name }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
/* 左侧菜单栏样式 */
.sidebar {
  background-color: #4D4D4D;
  flex: 1;
  overflow-y: auto;
  width: 100%;
  will-change: transform;
}

.sidebar-menu {
  border-right: none;
  width: 100%;
}

/* 覆盖Element Plus默认样式 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  text-align: center;
  padding: 0 !important;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.menu-text {
  text-align: center;
  display: inline-block;
  width: 100%;
}

:deep(.el-menu-item.is-active) {
  background-color: #333333;
}

:deep(.el-menu-item:hover) {
  background-color: #333333;
}
</style>