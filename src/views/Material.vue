<script setup>
import { ref, onMounted } from 'vue';
import { getUserInfo } from '../api/user.js';
import ElMessage from '../utils/message.js';
import { User, Edit } from '@element-plus/icons-vue';

// 管理员信息
const adminInfo = ref({
  adminId: '',
  account: '',
  nickName: '',
  role: '超级管理员', // 角色信息，可根据实际情况调整
  phoneNumber: '',
  email: '',
  loginTime: ''
});

// 页面加载状态
const loading = ref(false);

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
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      loginTime: userData.loginTime || ''
    };
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    ElMessage.error('获取管理员信息失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 修改个人信息
const handleEdit = () => {
  ElMessage.info('功能开发中...');
};

onMounted(() => {
  fetchAdminInfo();
});
</script>

<template>
  <div class="material-container" v-loading="loading">
    <div class="admin-info-card">
      <div class="card-header">
        <div class="title">
          <img src="../assets/material/Gc_26_face-NotaryPublic.png" class="admin-icon" alt="管理员头像" />
          <span>管理员信息</span>
        </div>
      </div>
      
      <div class="card-content">
        <div class="info-item">
          <span class="label">管理员ID</span>
          <span class="value">{{ adminInfo.adminId }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">姓名</span>
          <span class="value">{{ adminInfo.nickName }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">账号</span>
          <span class="value">{{ adminInfo.account }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">角色</span>
          <span class="value">{{ adminInfo.role }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">手机号</span>
          <span class="value">{{ adminInfo.phoneNumber }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">邮箱</span>
          <span class="value">{{ adminInfo.email }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">最后登录</span>
          <span class="value">{{ adminInfo.loginTime }} ({{ adminInfo.loginIp || '192.168.1.1' }})</span>
        </div>
      </div>
      
      <div class="card-footer">
        <el-button type="primary" @click="handleEdit" class="edit-btn">
          <el-icon><Edit /></el-icon>
          修改信息
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
}

.admin-info-card {
  width: 100%;
  max-width: 600px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e8eaec;
}

.title {
  display: flex;
  align-items: center;
}

.title span {
  color: #2d68ff;
  font-size: 18px;
  font-weight: bold;
}

.admin-icon {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}

.card-content {
  padding: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 20px;
  line-height: 30px;
  border-bottom: 1px dashed #e8e8e8;
  padding-bottom: 10px;
}

.label {
  flex: 0 0 120px;
  color: #606266;
  font-weight: 500;
}

.value {
  flex: 1;
  color: #303133;
}

.card-footer {
  padding: 10px 20px 20px;
  justify-content: center;
  border-radius: 0 0 8px 8px;
}

.edit-btn {
  width: 120px;
  background-color: #4080ff;
  border-color: #4080ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn .el-icon {
  margin-right: 5px;
}
</style> 