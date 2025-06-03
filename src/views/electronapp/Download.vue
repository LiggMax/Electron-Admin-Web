<template>
  <el-container class="download-container">
    <el-main class="download-main">
      <!-- 页面标题 -->
      <el-row class="page-header" justify="center">
        <el-col :span="24">
          <div class="header-content">
            <h1 class="page-title">应用下载中心</h1>
            <p class="page-subtitle">选择应用类型，下载最新版本</p>
          </div>
        </el-col>
      </el-row>

      <!-- 应用类型切换 -->
      <el-row class="app-type-section" justify="center">
        <el-col :span="24" :md="16" :lg="12">
          <div class="selector-container">
            <el-segmented 
              v-model="activeTab" 
              :options="tabOptions" 
              size="large"
              class="app-selector"
            />
          </div>
        </el-col>
      </el-row>

      <!-- 版本列表容器 -->
      <el-row class="version-section">
        <el-col :span="24">
          <el-card class="version-container" shadow="hover">
            <!-- 容器标题 -->
            <template #header>
              <div class="container-header">
                <h2 class="container-title">
                  {{ activeTab === 'client' ? '客户端' : '卡商端' }} 版本列表
                </h2>
                <el-tag type="info" size="large">
                  共 {{ currentVersions.length }} 个可用版本
                </el-tag>
              </div>
            </template>

            <!-- 版本网格 -->
            <el-row :gutter="24" v-if="currentVersions.length > 0">
              <el-col 
                :span="24" 
                v-for="version in currentVersions" 
                :key="version.id"
                class="version-col"
              >
                <div class="version-item">
                  <!-- 左侧信息区域 -->
                  <div class="version-info">
                    <div class="version-header">
                      <el-tag type="primary" size="large" effect="dark" class="version-tag">
                        v{{ version.version }}
                      </el-tag>
                    </div>
                    
                    <h3 class="version-title">{{ version.releaseNotes }}</h3>
                    
                    <div class="version-meta">
                      <div class="meta-item">
                        <span class="meta-label">文件大小:</span>
                        <el-tag type="success" size="small" class="meta-value">
                          {{ formatFileSize(version.fileSize) }}
                        </el-tag>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">发布时间:</span>
                        <span class="meta-value">{{ formatDateTime(version.uploadTime) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 右侧下载按钮 -->
                  <div class="version-action">
                    <el-button 
                      type="primary" 
                      size="large"
                      :icon="Download"
                      @click="downloadVersion(version)"
                      class="download-btn"
                    >
                      立即下载
                    </el-button>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 空状态 -->
            <el-empty 
              v-else
              description="暂无可用版本"
              :image-size="120"
            >
              <template #image>
                <el-icon size="120" color="#e8e8e8">
                  <Document />
                </el-icon>
              </template>
              <p class="empty-description">当前应用类型暂时没有可下载的版本</p>
            </el-empty>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { getUpdateAPPList } from "../../api/app.js";
import { ElMessage } from 'element-plus';
import { Download, Document } from '@element-plus/icons-vue';

const appList = ref([]);
const activeTab = ref('client'); // 当前选中的标签页
const clientVersions = ref([]);   // 客户端版本列表 (app=0)
const merchantVersions = ref([]); // 卡商端版本列表 (app=1)

// 标签页选项
const tabOptions = [
  {
    label: `客户端 (${computed(() => clientVersions.value.length).value})`,
    value: 'client'
  },
  {
    label: `卡商端 (${computed(() => merchantVersions.value.length).value})`,
    value: 'merchant'
  }
];

// 当前显示的版本列表
const currentVersions = computed(() => {
  return activeTab.value === 'client' ? clientVersions.value : merchantVersions.value;
});

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '未知';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 获取软件更新列表
 */
const getAPPList = async () => {
  try {
    const res = await getUpdateAPPList();
    if (res.code === 200 && res.data && res.data.list) {
      appList.value = res.data.list;
      
      // 分别获取客户端和卡商端的版本列表，按上传时间倒序
      clientVersions.value = res.data.list
        .filter(item => item.app === 0)
        .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
      
      merchantVersions.value = res.data.list
        .filter(item => item.app === 1)
        .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
      

      // 更新标签页选项
      tabOptions[0].label = `客户端 (${clientVersions.value.length})`;
      tabOptions[1].label = `卡商端 (${merchantVersions.value.length})`;
    }
  } catch (error) {
    console.error('获取软件更新列表失败:', error);
    ElMessage.error('获取软件列表失败');
  }
};

/**
 * 下载指定版本
 */
const downloadVersion = (version) => {
  const appType = version.app === 0 ? '客户端' : '卡商端';
  ElMessage.success(`开始下载${appType} v${version.version}`);
  
  // 创建临时链接下载文件
  const link = document.createElement('a');
  link.href = version.downloadUrl;
  link.download = `长虹国际${appType}-v${version.version}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  getAPPList();
});
</script>

<style scoped>
/* 确保页面可以正常滚动 */
:deep(body) {
  overflow-y: auto !important;
}

.download-container {
  height: 100vh;
  background: #f5f7fa;
}

.download-main {
  padding: 24px;
  overflow-y: auto; /* 确保主容器可以滚动 */
}

/* 页面标题 */
.page-header {
  margin-bottom: 32px;
  padding: 20px 0;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  font-weight: 400;
}

/* 应用类型选择器 */
.app-type-section {
  margin-bottom: 32px;
}

.selector-container {
  text-align: center;
}

.app-selector {
  width: 100%;
}

:deep(.el-segmented) {
  padding: 4px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-segmented__item) {
  padding: 16px 24px;
  font-weight: 600;
  border-radius: 8px;
}

:deep(.el-segmented__item.is-selected) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 版本列表容器 */
.version-section {
  margin-bottom: 32px;
}

.version-container {
  border-radius: 16px;
  overflow: visible;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9ff 0%, #faf8ff 100%);
  border-bottom: 1px solid #f0f0f0;
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 版本卡片 */
.version-col {
  margin-bottom: 16px;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.version-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.version-info {
  flex: 1;
  min-width: 0; /* 防止flex项目溢出 */
}

.version-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.version-tag {
  flex-shrink: 0;
}

.upload-date {
  color: #999;
  font-size: 0.85rem;
  margin-left: auto;
}

.version-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.version-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
}

.meta-label {
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 500;
}

.version-action {
  margin-left: 24px;
  flex-shrink: 0;
}

.download-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

:deep(.download-btn:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

/* 空状态 */
.empty-description {
  color: #999;
  margin-top: 16px;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .download-main {
    padding: 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .selector-container {
    padding: 0;
  }

  .container-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .version-col {
    margin-bottom: 12px;
  }

  .version-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 16px;
  }

  .version-header {
    width: 100%;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .upload-date {
    margin-left: 0;
  }

  .version-title {
    margin-bottom: 12px;
  }

  .version-meta {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }

  .meta-item {
    justify-content: space-between;
    width: 100%;
  }

  .version-action {
    margin-left: 0;
    margin-top: 0;
    width: 100%;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>