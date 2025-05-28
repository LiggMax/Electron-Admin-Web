<script setup>
import { ref, reactive, onMounted } from 'vue'
import IconUser from '../assets/material/user.png'
import IconPassword from '../assets/material/password.png'
import { loginService } from "../api/login.js";
import { userTokenStore } from "../store/token.js";
import Message from '../utils/message.js'
import { useRouter } from 'vue-router'

const userToken = userTokenStore()
const router = useRouter()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 加载状态
const loading = ref(false)

// 页面加载时读取localStorage中的用户名和密码
onMounted(() => {
  const storedUsername = localStorage.getItem('rememberedUsername')
  const storedPassword = localStorage.getItem('rememberedPassword')
  if (storedUsername && storedPassword) {
    loginForm.username = storedUsername
    loginForm.password = storedPassword
    loginForm.remember = true
  }
})

// 登录方法
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    Message.warning('请输入用户名和密码')
    return
  }
  
  // 设置加载状态
  loading.value = true
  
  try {
    const res = await loginService({
      account: loginForm.username,
      password: loginForm.password
    })
    
    userToken.setToken(res.data)
    Message.success('登录成功')
    // 登录成功后跳转到首页
    await router.push('/')
    
    // 如果勾选了“记住密码”，则保存用户名和密码到localStorage
    if (loginForm.remember) {
      localStorage.setItem('rememberedUsername', loginForm.username)
      localStorage.setItem('rememberedPassword', loginForm.password)
    } else {
      // 如果取消勾选“记住密码”，则清除localStorage中的数据
      localStorage.removeItem('rememberedUsername')
      localStorage.removeItem('rememberedPassword')
    }
  } finally {
    // 无论成功或失败，都重置加载状态
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container" @keydown.enter="handleLogin">
    <div class="login-form">
      <div class="login-header">
        <h1>长虹国际管理介面</h1>
      </div>
      <div class="form-item">
        <div class="input-container">
          <div class="icon-wrapper">
            <img :src="IconUser" class="icon-image" alt=""/>
          </div>
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入账号"
            size="large"
          />
        </div>
      </div>
      <div class="form-item">
        <div class="input-container">
          <div class="icon-wrapper">
            <img :src="IconPassword" class="icon-image" alt=""/>
          </div>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
          />
        </div>
      </div>
      <div class="remember-box">
        <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
      </div>
      <div class="form-item">
        <el-button
          type="primary" 
          class="login-button" 
          @click="handleLogin"
          :loading="loading"
        >
          登 录
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保页面占满整个浏览器窗口 */
.login-container {
  width: 100%;
  height: 100vh;
  background-image: url('../assets/material/loginbackground.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 登录表单样式 */
.login-form {
  width: 400px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin-right: 10%;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  margin: 0;
}

.form-item {
  margin-bottom: 30px;
}

/* 自定义输入框和图标样式 */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.icon-wrapper {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-image {
  width: 16px;
  height: 16px;
}

/* 调整Element Plus输入框高度 */

:deep(.el-input__wrapper) {
  padding: 0 11px 0 35px;
  height: 45px;
  border-radius: 3px;
}

.remember-box {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

/* 调整勾选框和文字的间距 */

.login-button {
  width: 100%;
  height: 45px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* 使用Element Plus主题色覆盖 */

/* 覆盖可能的全局样式 */
:deep(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>