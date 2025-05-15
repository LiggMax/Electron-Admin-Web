<template>
  <div class="phone-container">
    <div class="search-bar">
      <el-form :inline="true" class="form-inline">
        <el-form-item label="客户ID:">
          <el-input v-model="searchForm.merchantId" placeholder="请输入卡商ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="button-group">
      <el-button type="primary" @click="handleAdd">添加号码</el-button>
      <el-button type="primary" @click="batchOperation">批量分配</el-button>
    </div>

    <div class="table-container">
      <div class="selected-hint" v-if="selectedItems.length > 0">
        <el-icon><InfoFilled /></el-icon>
        已选择 {{ selectedItems.length }} 项
        <el-link type="primary" @click="clearSelection">清除</el-link>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="phoneNum" label="号码" width="180" />
        <el-table-column prop="country" label="国家/地区" width="120" />
        <el-table-column prop="project" label="项目" width="180" />
        <el-table-column prop="status" label="账号状态" width="120" />
        <el-table-column prop="usage" label="使用情况" />
        <el-table-column prop="createTime" label="上传时间" width="180" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { getPhoneList, deletePhone } from '../api/phone.js'

// 搜索表单
const searchForm = reactive({
  country: '',
  project: '',
  merchantId: ''
})

// 表格数据
const tableData = ref([])

// 状态映射
const statusMap = {
  0: '空闲',
  1: '已用'
}

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
    const res = await getPhoneList()
      // 处理数据映射
      tableData.value = res.data.map(item => {
        return {
          phoneId: item.phoneId,
          phoneNum: item.phoneNumber,
          // 由于接口中没有返回国家信息，这里可能需要根据phoneRegionId转换
          country: item.phoneRegionId === 1 ? '中国大陆' : '',
          // 项目名称映射，可能需要根据phoneProjectId转换
          project: item.phoneProjectId === 1 ? 'Facebook/WhatsApp' : '',
          // 状态映射
          status: statusMap[item.usageStatus] || '未知',
          usage: item.usageStatus,
          createTime: item.registrationTime ? item.registrationTime.split('T')[0] : ''
        }
      })
      total.value = res.data.length
  } catch (error) {
    console.error('加载数据出错:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  currentPage.value = 1
  // 此处可以添加搜索过滤逻辑，当接口支持时更新
  loadData()
}

// 重置表单
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 添加号码
const handleAdd = () => {
  // TODO: 实现添加号码的逻辑
  ElMessage.success('添加号码功能待实现')
}

// 批量分配
const batchOperation = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择号码')
    return
  }
  // TODO: 实现批量分配的逻辑
  ElMessage.success(`已选择${selectedItems.value.length}项进行批量操作`)
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

// 清除选择
const clearSelection = () => {
  tableRef.value.clearSelection()
}

// 编辑行
const handleEdit = (row) => {
  console.log('编辑：', row)
  ElMessage.success('编辑功能待实现')
}

// 删除行
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该号码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deletePhone(row.phoneId)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadData() // 重新加载数据
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除出错:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  loadData()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadData()
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

.button-group {
  margin-bottom: 20px;
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

.selected-hint .el-icon {
  margin-right: 8px;
}

.selected-hint .el-link {
  margin-left: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 