<script setup>
import { computed } from 'vue'

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
</script>

<template>
  <div class="top-header">
    {{ fullTitle }}
  </div>
</template>

<style scoped>
/* 顶部标题栏样式 */
.top-header {
  background-color: #F99B6D;
  color: #fff;
  font-size: 16px;
  line-height: 50px;
  padding: 0 15px;
  font-weight: normal;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
</style> 