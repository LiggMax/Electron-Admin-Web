<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Message,
  User, 
  Document, 
  Phone, 
  Coin, 
  Location, 
  ShoppingCart, 
  DataAnalysis,
  Upload,
  SwitchButton 
} from '@element-plus/icons-vue'

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
  { id: '1', name: '公共栏管理', icon: Message, route: '/', color: '#667eea' },
  { id: '2', name: '客户管理', icon: User, route: '/customer', color: '#4facfe' },
  { id: '3', name: '卡商管理', icon: Document, route: '/merchant', color: '#43e97b' },
  { id: '4', name: '号码管理', icon: Phone, route: '/phone', color: '#fa709a' },
  { id: '5', name: '项目管理', icon: Coin, route: '/project', color: '#ffd89b' },
  { id: '6', name: '地区管理', icon: Location, route: '/region', color: '#a8edea' },
  { id: '7', name: '订单管理', icon: ShoppingCart, route: '/order', color: '#d299c2' },
  { id: '8', name: '资料管理', icon: DataAnalysis, route: '/material', color: '#89f7fe' },
  { id: '9', name: '账单管理', icon: Upload, route: '/bill', color: '#fbc2eb' },
  { id: '10', name: '登出账号', icon: SwitchButton, route: '/logout', color: '#ff9a9e' }
])

// 菜单点击事件
const emit = defineEmits(['menu-change'])
const handleMenuClick = (menu) => {
  if (!menu) return
  emit('menu-change', menu.name)
  
  // 如果是登出账号，需要特殊处理
  if (menu.id === '10') {
    // TODO: 实现登出逻辑
    console.log('登出账号')
    // 跳转到登录页
    router.push('/login')
  }
}
</script>

<template>
  <div class="sidebar">
    <!-- 动画背景层 -->
    <div class="animation-layer">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
      <div class="particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      router
      :collapse="false"
      background-color="transparent"
      text-color="rgba(255, 255, 255, 0.8)"
      active-text-color="#fff"
      @select="(index) => handleMenuClick(menuItems.find(item => item.id === index))"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.id"
        :index="item.id"
        :route="item.route"
        class="custom-menu-item"
      >
        <div class="menu-item-content">
          <div class="menu-icon" :style="{ background: `linear-gradient(45deg, ${item.color}, ${item.color}88)` }">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <span class="menu-text">{{ item.name }}</span>
        </div>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
/* 左侧菜单栏样式 */
.sidebar {
  background: linear-gradient(180deg, #2C3E50 0%, #34495E 50%, #2C3E50 100%);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

/* 动画背景层 */
.animation-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 波纹效果 */
.wave {
  position: absolute;
  width: 300%;
  height: 300%;
  top: -100%;
  left: -100%;
  background: radial-gradient(ellipse at center, transparent, transparent 40%, rgba(255, 255, 255, 0.1) 40%, transparent 41%);
  animation: wave-animation 15s linear infinite;
  opacity: 0.5;
}

.wave1 {
  animation-duration: 20s;
  background: radial-gradient(ellipse at center, transparent, transparent 35%, rgba(255, 255, 255, 0.08) 35%, transparent 36%);
}

.wave2 {
  animation-duration: 25s;
  animation-delay: -5s;
  background: radial-gradient(ellipse at center, transparent, transparent 38%, rgba(255, 255, 255, 0.06) 38%, transparent 39%);
}

.wave3 {
  animation-duration: 30s;
  animation-delay: -10s;
  background: radial-gradient(ellipse at center, transparent, transparent 42%, rgba(255, 255, 255, 0.04) 42%, transparent 43%);
}

@keyframes wave-animation {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* 粒子效果 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particles span {
  position: absolute;
  display: block;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  opacity: 0;
  animation: particle-float 10s linear infinite;
}

.particles span:nth-child(1) {
  left: 10%;
  animation-delay: 0s;
  animation-duration: 8s;
}

.particles span:nth-child(2) {
  left: 30%;
  animation-delay: 2s;
  animation-duration: 10s;
}

.particles span:nth-child(3) {
  left: 50%;
  animation-delay: 4s;
  animation-duration: 12s;
}

.particles span:nth-child(4) {
  left: 70%;
  animation-delay: 6s;
  animation-duration: 9s;
}

.particles span:nth-child(5) {
  left: 90%;
  animation-delay: 8s;
  animation-duration: 11s;
}

@keyframes particle-float {
  0% {
    bottom: -10px;
    opacity: 0;
    transform: translateX(0);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(100px);
  }
}

.sidebar-menu {
  border-right: none;
  width: 100%;
  background: transparent;
  padding: 10px 0;
  position: relative;
  z-index: 2;
  flex: 1;
}

/* 覆盖Element Plus默认样式 */

:deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
  padding: 0 15px !important;
  margin: 5px 10px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  position: relative;
  overflow: hidden;
}


.custom-menu-item {
  justify-content: flex-start !important;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.menu-icon {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: left;
  transition: all 0.3s ease;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transform: translateX(5px);
}

:deep(.el-menu-item.is-active .menu-icon) {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

:deep(.el-menu-item.is-active .menu-text) {
  color: white;
  font-weight: 600;
}

:deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
  transform: translateX(3px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.el-menu-item:hover .menu-icon) {
  transform: scale(1.05);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
}

:deep(.el-menu-item:hover .menu-text) {
  color: white;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .sidebar-header {
    padding: 15px 10px;
  }

  .menu-icon {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
  
  .menu-text {
    font-size: 13px;
  }
}

@media screen and (max-width: 480px) {

  .menu-item-content {
    gap: 10px;
  }
  
  .menu-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .menu-text {
    font-size: 12px;
  }
}
</style>