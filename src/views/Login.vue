<script setup>
import { ref, reactive } from 'vue'
import IconUser from '../assets/material/user.png'
import IconPassword from '../assets/material/password.png'
import {loginService} from "../api/login.js";
import {userTokenStore} from "../store/token.js";
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

// 登录方法
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    Message.warning('请输入用户名和密码')
    return
  }
  
    const res = await loginService({
      account: loginForm.username,
      password: loginForm.password
    })
    
      userToken.setToken(res.data)
      Message.success('登录成功')
      // 登录成功后跳转到首页
      await router.push('/')
}
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h1>欢迎使用管理后台</h1>
      </div>
      <div class="form-item">
        <div class="input-container">
          <div class="icon-wrapper">
            <img :src="IconUser" class="icon-image"  alt=""/>
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
            <img :src="IconPassword" class="icon-image" />
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
        <el-button type="primary" class="login-button" @click="handleLogin">登 录</el-button>
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
:deep(.el-input) {
  height: 45px;
  width: 100%;
}

:deep(.el-input__wrapper) {
  padding: 0 11px 0 35px;
  height: 45px;
  border-radius: 3px;
}

:deep(.el-input__inner) {
  height: 45px;
  line-height: 45px;
  font-size: 14px;
}

.remember-box {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

/* 调整勾选框和文字的间距 */
:deep(.el-checkbox) {
  height: 20px;
  line-height: 20px;
}

:deep(.el-checkbox__label) {
  padding-left: 10px;
  font-size: 14px;
  color: #606266;
}

:deep(.el-checkbox__inner) {
  border-radius: 2px;
}

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
:deep(.el-button--primary) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

:deep(.el-button--primary:hover) {
  background-color: #f78989;
  border-color: #f78989;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

/* 覆盖可能的全局样式 */
:deep(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>