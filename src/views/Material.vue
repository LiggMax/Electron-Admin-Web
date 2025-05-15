<script setup>
import { ref, onMounted, reactive } from 'vue';
import {getUserInfo, updateUserInfo} from '../api/user.js';
import { Edit } from '@element-plus/icons-vue';

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
  loginIp: ''
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
      loginIp: userData.loginIp || ''
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
          <span class="value">{{ DateFormatter.format(adminInfo.loginTime) }} <span v-if="adminInfo.loginIp">   (IP地址:{{ adminInfo.loginIp}}) </span></span>
        </div>
      </div>
      
      <div class="card-footer">
        <el-button type="primary" @click="handleEdit" class="edit-btn">
          <el-icon><Edit /></el-icon>
          修改信息
        </el-button>
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-btn .el-icon {
  margin-right: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 