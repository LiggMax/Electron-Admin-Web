<template>
  <div class="phone-container">
    <div class="search-bar">
      <el-form :inline="true" class="form-inline">
        <el-form-item label="号码搜索:">
          <el-input v-model="searchForm.phoneNumber" placeholder="请输入号码，支持模糊搜索"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="selected-hint" v-if="selectedItems.length > 0">
        <el-icon>
          <InfoFilled/>
        </el-icon>
        已选择 {{ selectedItems.length }} 项
        <el-link type="primary" @click="clearSelection">清除</el-link>
      </div>

      <el-table
          ref="tableRef"
          :data="tableData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="phoneNum" label="号码" width="180"/>
        <el-table-column prop="nickName" label="卡商" width="120">
          <template #default="scope">
           <span class="merchant-avatar">
                <img v-if="scope.row.avatar" :src="scope.row.avatar" alt="头像"/>
           </span>
            <span>{{ scope.row.nickName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isAvailable" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
                :type="scope.row.isAvailable ? 'success' : 'danger'"
                size="small"
            >
              {{ scope.row.isAvailable ? '在售' : '售完' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="country" label="国家/地区" width="120"/>
        <el-table-column prop="projects" label="项目" width="200">
          <template #default="scope">
            <div class="projects-container">
              <el-tag
                  v-for="project in scope.row.projects"
                  :key="project.projectId"
                  size="small"
                  class="project-tag"
                  :title="`${project.projectName} - ¥${formatPrice(project.projectPrice)}`"
              >
                {{ project.projectName }}
              </el-tag>
              <el-popover
                  v-if="scope.row.projects.length > 3"
                  placement="top"
                  width="300"
                  trigger="hover"
              >
                <template #reference>
                  <el-tag size="small" type="info" class="more-tag">
                    +{{ scope.row.projects.length - 3 }}
                  </el-tag>
                </template>
                <div class="project-details">
                  <div
                      v-for="project in scope.row.projects"
                      :key="project.projectId"
                      class="project-detail-item"
                  >
                    <span class="project-name">{{ project.projectName }}</span>
                    <span class="project-price">¥{{ formatPrice(project.projectPrice) }}</span>
                  </div>
                </div>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上传时间" width="180"/>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button type="warning" size="small" @click="handleEdit(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue'
import {ElMessageBox} from 'element-plus'
import {InfoFilled} from '@element-plus/icons-vue'
import {getPhoneList, deletePhone, batchOperatePhone} from '../api/phone.js'
import DateFormatter from '../utils/DateFormatter.js'
import Message from '../utils/message.js'
// 搜索表单
const searchForm = reactive({
  phoneNumber: ''
})

// 表格数据
const tableData = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 选中项
const selectedItems = ref([])
const tableRef = ref(null)

// 初始化
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = async () => {
  try {
    const query = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      phoneNumber: searchForm.phoneNumber
    }
    const res = await getPhoneList(query)

    // 处理数据映射
    tableData.value = (res.data.list || []).map(item => {
      return {
        phoneId: item.phoneId,
        phoneNum: item.phoneNumber,
        country: item.regionName,
        projects: item.projects || [],
        usage: item.usageStatus,
        money: item.money,
        nickName: item.adminNickName,
        avatar: item.adminAvatar,
        createTime: DateFormatter.format(item.registrationTime),
        isAvailable: item.isAvailable
      }
    })
    total.value = res.data.total || 0
  } catch (error) {
    console.error('加载数据出错:', error)
    tableData.value = []
    total.value = 0
  }
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  currentPage.value = 1
  loadData()
}

// 重置表单
const resetForm = () => {
  searchForm.phoneNumber = ''
  currentPage.value = 1
  loadData()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

// 批量清除选择
const clearSelection = () => {
  if (selectedItems.value.length === 0) {
    Message.warning('请先选择要删除的号码')
    return
  }
  ElMessageBox.confirm(
      `确定要删除选择的${selectedItems.value.length}个号码吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      const phoneIds = selectedItems.value.map(item => item.phoneId)
      await batchOperatePhone(phoneIds)
      Message.success('批量删除成功')
      selectedItems.value = [] // 清空选择
      await loadData() // 重新加载数据
    } catch (error) {
      console.error('批量删除出错:', error)
      Message.error('批量删除失败')
    }
  }).catch(() => {
    // 用户取消操作
    Message.info('已取消删除操作')
  })
}

// 编辑行
const handleEdit = (row) => {
  console.log('编辑：', row)
  Message.success('编辑功能待实现')
}

// 删除行
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该号码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deletePhone(row.phoneId);
      Message.success('删除成功')
      await loadData() // 重新加载数据
    } catch (error) {
      console.error('删除出错:', error)
      Message.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  loadData()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadData()
}

// 格式化价格
const formatPrice = (price) => {
  if (price === undefined || price === null) return '0.00'
  return Number(price).toFixed(2)
}
</script>

<style scoped>
.phone-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.selected-hint {
  margin-bottom: 10px;
  padding: 8px 16px;
  background-color: #f0f9eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: #67c23a;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.merchant-avatar {
  display: inline-block;
  margin-right: 8px;
}

.merchant-avatar img {
  width: 28px;
  border-radius: 50%;
  vertical-align: middle;
}


/* 项目列样式 */
.projects-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.project-tag {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-tag:nth-child(n+4) {
  display: none;
}

.more-tag {
  cursor: pointer;
}

.project-details {
  max-height: 200px;
  overflow-y: auto;
}

.project-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.project-detail-item:last-child {
  border-bottom: none;
}

.project-name {
  flex: 1;
  margin-right: 10px;
}

.project-price {
  color: #f56c6c;
  font-weight: bold;
}
</style> 