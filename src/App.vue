<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { ref } from 'vue'

// 设置默认语言为中文
const locale = ref(zhCn)

</script>

<template>
  <el-config-provider :locale="locale">
    <router-view/>
  </el-config-provider>
</template>

<style scoped>

</style>
