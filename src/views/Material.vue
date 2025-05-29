<script setup>
import { ref, onMounted, reactive } from 'vue';
import {getUserInfo, updateUserInfo} from '../api/user.js';
import { Edit,User,Memo, Phone, Clock, Location } from '@element-plus/icons-vue';

import DateFormatter from "../utils/DateFormatter.js";
import Message from "../utils/message.js";
// 管理员信息
const adminInfo = ref({
  adminId: '',
  account: '',
  nickName: '',
  role: '超级管理员', // 角色信息，可根据实际情况调整
  phoneNumber: '',
  email: '',
  loginTime: '',
  loginIp: '',
  money: 0
});

// 编辑表单
const editForm = reactive({
  nickName: '',
  phoneNumber: '',
  email: ''
});

// 页面加载状态
const loading = ref(false);
// 表单提交状态
const submitting = ref(false);

// 表单校验规则
const rules = {
  nickName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

// 编辑对话框可见性
const dialogVisible = ref(false);

// 表单引用，用于校验
const formRef = ref(null);

// 获取管理员信息
const fetchAdminInfo = async () => {
  loading.value = true;
  try {
    const response = await getUserInfo();
    const userData = response.data;
    
    // 处理数据
    adminInfo.value = {
      adminId: userData.adminId || '',
      account: userData.account || '',
      nickName: userData.nickName || '',
      role: '超级管理员',
      phoneNumber: userData.phoneNumber || '',
      email: userData.email || '',
      loginTime: userData.loginTime || '',
      loginIp: userData.loginIp || '',
      money: userData.money || 0
    };
  } catch (error) {
    console.error('获取管理员信息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 打开编辑对话框
const handleEdit = () => {
  // 填充表单数据
  editForm.nickName = adminInfo.value.nickName;
  editForm.phoneNumber = adminInfo.value.phoneNumber;
  editForm.email = adminInfo.value.email;
  
  // 显示对话框
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    // 表单验证
    await formRef.value.validate();
    
    // 设置提交状态
    submitting.value = true;
    
    // 准备提交的数据
    const updateData = {
      nickName: editForm.nickName,
      phoneNumber: editForm.phoneNumber,
      email: editForm.email
    };
    
    // 调用API更新用户信息
    await updateUserInfo(updateData);
    // 提示成功
    Message.success('修改成功');
    
    // 关闭对话框
    dialogVisible.value = false;
    
    // 重新获取最新的用户信息
    await fetchAdminInfo();
  } catch (error) {
    console.error('更新用户信息失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  dialogVisible.value = false;
};

onMounted(() => {
  fetchAdminInfo();
});
</script>

<template>
  <div class="material-container" v-loading="loading">
    <div class="cards-row">


      <div class="admin-info-card">
        <div class="card-header">
          <div class="admin-profile-header">
            <div class="admin-avatar">
              <span>{{ adminInfo.nickName?.charAt(0)?.toUpperCase() || 'A' }}</span>
            </div>
            <div class="admin-basic-info">
              <div class="admin-name">{{ adminInfo.nickName || '管理员' }}</div>
              <div class="admin-role">{{ adminInfo.role }}</div>
              <div class="admin-account">@{{ adminInfo.account }}</div>
            </div>
            <div class="edit-button-container">
              <el-button type="primary" @click="handleEdit" class="edit-btn" circle>
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="info-content">
                <span class="label">管理员ID</span>
                <span class="value">{{ adminInfo.adminId }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="info-content">
                <span class="label">手机号</span>
                <span class="value">{{ adminInfo.phoneNumber || '未设置' }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <el-icon><Memo /></el-icon>
              </div>
              <div class="info-content">
                <span class="label">邮箱</span>
                <span class="value">{{ adminInfo.email || '未设置' }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="info-content">
                <span class="label">最后登录</span>
                <span class="value">{{ DateFormatter.format(adminInfo.loginTime) }}</span>
              </div>
            </div>
            
            <div class="info-item" v-if="adminInfo.loginIp">
              <div class="info-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="info-content">
                <span class="label">登录IP</span>
                <span class="value">{{ adminInfo.loginIp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="money-card">
        <div class="money-header">
          <div class="money-title">
            <img src="../assets/material/Gc_26_face-NotaryPublic.png" class="money-icon" alt="金额图标" />
            <span>平台余额</span>
          </div>
        </div>
        <div class="money-content">
          <div class="money-amount">
            <span class="currency">￥</span>
            <span class="amount">{{ adminInfo.money.toFixed(2) }}</span>
          </div>
          <div class="money-description">当前可用余额</div>
        </div>
      </div>
    </div>
    
    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="修改个人信息"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="rules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="姓名" prop="nickName">
          <el-input v-model="editForm.nickName" placeholder="请输入姓名"></el-input>
        </el-form-item>
        
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="editForm.phoneNumber" placeholder="请输入手机号"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelEdit" :disabled="submitting">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.material-container {
  padding: clamp(10px, 2vw, 30px);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 80vh;
  gap: clamp(15px, 2vw, 25px);
  width: 100%;
  box-sizing: border-box;
}

.cards-row {
  display: flex;
  gap: clamp(15px, 2vw, 25px);
  width: 100%;
  max-width: min(1200px, 95vw);
  justify-content: center;
  align-items: stretch;
}

.money-card {
  flex: 0 0 clamp(280px, 30vw, 380px);
  min-width: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: clamp(8px, 1vw, 12px);
  box-shadow: 0 8px 32px 0 rgba(102, 126, 234, 0.3);
  overflow: hidden;
  color: white;
  position: relative;
}

.money-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="20" cy="80" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.money-header {
  padding: clamp(16px, 2vw, 24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.money-title {
  display: flex;
  align-items: center;
}

.money-title span {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.money-icon {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  filter: brightness(0) invert(1);
}

.money-content {
  padding: clamp(24px, 3vw, 32px);
  text-align: center;
  position: relative;
  z-index: 1;
}

.money-amount {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -1px;
}

.currency {
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(20px, 3vw, 32px);
  margin-right: 4px;
}

.amount {
  color: white;
}

.money-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.admin-info-card {
  flex: 1 1 auto;
  min-width: 320px;
  max-width: clamp(500px, 60vw, 700px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: clamp(8px, 1vw, 12px);
  box-shadow: 0 8px 32px 0 rgba(102, 126, 234, 0.3);
  overflow: hidden;
  color: white;
  position: relative;
}

.admin-info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="admin-grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.08)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.04)"/><circle cx="20" cy="80" r="0.5" fill="rgba(255,255,255,0.04)"/></pattern></defs><rect width="100" height="100" fill="url(%23admin-grain)"/></svg>');
  pointer-events: none;
}

.card-header {
  padding: clamp(16px, 2vw, 24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.admin-profile-header {
  display: flex;
  align-items: center;
}

.admin-avatar {
  width: clamp(40px, 5vw, 60px);
  height: clamp(40px, 5vw, 60px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: clamp(12px, 1.5vw, 16px);
  font-size: clamp(16px, 2.5vw, 24px);
  font-weight: bold;
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.admin-basic-info {
  flex: 1;
}

.admin-name {
  font-size: clamp(16px, 2.5vw, 22px);
  font-weight: 700;
  margin-bottom: 4px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.admin-role {
  font-size: clamp(12px, 1.5vw, 16px);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
  font-weight: 500;
}

.admin-account {
  font-size: clamp(10px, 1.2vw, 14px);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.edit-button-container {
  margin-left: auto;
}

.edit-btn {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.card-content {
  padding: clamp(16px, 2vw, 24px);
  position: relative;
  z-index: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  color: white;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 14px;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

/* 响应式设计 */
/* 大屏幕优化 */
@media screen and (min-width: 1400px) {
  .material-container {
    padding: 30px;
  }
  
  .cards-row {
    max-width: 1400px;
    gap: 30px;
  }
  
  .admin-info-card {
    max-width: 700px;
  }
  
  .money-card {
    flex: 0 0 400px;
  }
}

/* 中等屏幕优化 */
@media screen and (max-width: 1200px) {
  .material-container {
    padding: 20px;
  }
  
  .cards-row {
    gap: 16px;
  }
  
  .money-card {
    flex: 0 0 320px;
  }
  
  .admin-info-card {
    max-width: 550px;
  }
  
  .admin-name {
    font-size: 20px;
  }
  
  .admin-avatar {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .edit-btn {
    width: 40px;
    height: 40px;
  }
  
  .info-grid {
    gap: 16px;
  }
  
  .info-item {
    padding: 14px;
  }
  
  .money-amount {
    font-size: 36px;
  }
  
  .currency {
    font-size: 28px;
  }
}

/* 小屏幕优化 */
@media screen and (max-width: 992px) {
  .material-container {
    padding: 16px;
  }
  
  .cards-row {
    flex-direction: column;
    gap: 20px;
    max-width: 100%;
  }
  
  .money-card {
    flex: none;
    width: 100%;
    max-width: none;
  }
  
  .admin-info-card {
    flex: none;
    width: 100%;
    max-width: none;
  }
  
  .card-header {
    padding: 20px;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .admin-profile-header {
    flex-direction: row;
    text-align: left;
  }
  
  .admin-avatar {
    margin-right: 16px;
    margin-bottom: 0;
  }
  
  .edit-button-container {
    margin-left: auto;
    margin-top: 0;
  }
  
  .info-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

/* 平板竖屏 */
@media screen and (max-width: 768px) {
  .material-container {
    padding: 15px;
  }
  
  .cards-row {
    gap: 15px;
  }
  
  .money-content {
    padding: 24px 20px;
  }
  
  .money-amount {
    font-size: 32px;
  }
  
  .currency {
    font-size: 24px;
  }
  
  .card-header {
    padding: 18px;
  }
  
  .admin-profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .admin-avatar {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .edit-button-container {
    margin-left: 0;
    margin-top: 12px;
  }
  
  .card-content {
    padding: 18px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  .info-item {
    padding: 12px;
  }
  
  .admin-name {
    font-size: 18px;
  }
  
  .admin-role {
    font-size: 14px;
  }
  
  .admin-account {
    font-size: 12px;
  }
  
  .label {
    font-size: 10px;
  }
  
  .value {
    font-size: 12px;
  }
}

/* 手机横屏 */
@media screen and (max-width: 640px) {
  .material-container {
    padding: 12px;
  }
  
  .cards-row {
    gap: 12px;
  }
  
  .money-card {
    border-radius: 8px;
  }
  
  .admin-info-card {
    border-radius: 8px;
  }
  
  .money-content {
    padding: 20px 16px;
  }
  
  .money-amount {
    font-size: 28px;
  }
  
  .currency {
    font-size: 20px;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .info-item {
    padding: 10px;
  }
  
  .info-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .admin-avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .edit-btn {
    width: 36px;
    height: 36px;
  }
}

/* 手机竖屏 */
@media screen and (max-width: 480px) {
  .material-container {
    padding: 10px;
  }
  
  .cards-row {
    gap: 10px;
  }
  
  .money-amount {
    font-size: 24px;
  }
  
  .currency {
    font-size: 18px;
  }
  
  .money-description {
    font-size: 12px;
  }
  
  .money-title span {
    font-size: 14px;
  }
  
  .admin-name {
    font-size: 16px;
  }
  
  .admin-role {
    font-size: 12px;
  }
  
  .admin-account {
    font-size: 10px;
  }
  
  .label {
    font-size: 9px;
  }
  
  .value {
    font-size: 11px;
  }
  
  .info-grid {
    gap: 10px;
  }
  
  .info-item {
    padding: 8px;
  }
  
  .info-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
    margin-right: 8px;
  }
  
  .card-header {
    padding: 12px;
  }
  
  .card-content {
    padding: 12px;
  }
}

/* 超小屏幕 */
@media screen and (max-width: 360px) {
  .material-container {
    padding: 8px;
  }
  
  .money-amount {
    font-size: 20px;
  }
  
  .currency {
    font-size: 16px;
  }
  
  .admin-name {
    font-size: 14px;
  }
  
  .admin-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .edit-btn {
    width: 32px;
    height: 32px;
  }
  
  .info-icon {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .admin-info-card::before,
  .money-card::before {
    background-size: 50px 50px;
  }
}

/* 容器查询支持 */
@container (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* 打印样式 */
@media print {
  .material-container {
    background: white !important;
    color: black !important;
    padding: 20px;
  }
  
  .admin-info-card,
  .money-card {
    background: white !important;
    color: black !important;
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
  
  .edit-btn {
    display: none !important;
  }
}
</style> 