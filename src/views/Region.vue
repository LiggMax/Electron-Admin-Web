<script setup>
import {ref, reactive, onMounted, computed, nextTick} from 'vue'
import ElMessage from '../utils/message.js'
import {ElMessageBox} from 'element-plus'
import {
  getRegionListService,
  deleteRegionService,
  saveOrUpdateRegion
} from "../api/region.js";
import DateFormatter from "../utils/DateFormatter.js";

// 查询条件
const queryForm = reactive({
  regionName: '',
})

// 表格数据
const tableData = ref([])
const originalData = ref([]) // 保存原始数据，用于本地搜索
const tableLoading = ref(false)

// 处理本地搜索，根据查询条件过滤数据
computed(() => {
  if (!queryForm.regionName) {
    return originalData.value
  }

  return originalData.value.filter(item => {
    return item.regionName.toLowerCase().includes(queryForm.regionName.toLowerCase())
  })
});
// 选中的行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}


// 添加地区弹窗相关
const addRegionVisible = ref(false)
const addRegionForm = reactive({
  regionName: '',
  regionCode: ''
})
const addRegionLoading = ref(false)
const addRegionFormRef = ref(null)

// 编辑地区弹窗相关
const editRegionVisible = ref(false)
const editRegionForm = reactive({
  id: '',
  regionName: '',
  regionCode: ''
})
const editRegionLoading = ref(false)
const editRegionFormRef = ref(null)

// 添加地区验证规则
const addRegionRules = {
  regionName: [
    {required: true, message: '请输入地区名称', trigger: 'blur'},
    {min: 1, max: 50, message: '地区名称长度需在1到50个字符之间', trigger: 'blur'}
  ],
  // regionCode: [
  //   {required: true, message: '请输入地区代码', trigger: 'blur'},
  //   {pattern: /^[A-Za-z0-9]+$/, message: '地区代码只能包含字母和数字', trigger: 'blur'}
  // ]
}

// 编辑地区验证规则
const editRegionRules = {
  regionName: [
    {required: true, message: '请输入地区名称', trigger: 'blur'},
    {min: 1, max: 50, message: '地区名称长度需在1到50个字符之间', trigger: 'blur'}
  ],
  regionCode: [
    {required: true, message: '请输入地区代码', trigger: 'blur'},
    {pattern: /^[A-Za-z0-9]+$/, message: '地区代码只能包含字母和数字', trigger: 'blur'}
  ]
}

// 添加地区
const handleAddRegion = () => {
  // 重置表单数据
  addRegionForm.regionName = ''
  addRegionForm.regionCode = ''

  // 显示添加地区弹窗
  addRegionVisible.value = true

  // 下一帧后重置表单校验结果
  nextTick(() => {
    addRegionFormRef.value?.resetFields()
  })
}

// 提交添加地区表单
const submitAddRegion = async () => {
  if (!addRegionFormRef.value) return

  try {
    // 表单校验
    await addRegionFormRef.value.validate()

    addRegionLoading.value = true

    // 准备请求数据
    const regionData = {
      regionName: addRegionForm.regionName,
      regionMark: addRegionForm.regionCode
    }

    // 调用API
    await saveOrUpdateRegion(regionData)

    ElMessage.success('地区添加成功')
    addRegionVisible.value = false
    await fetchRegions() // 刷新数据
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('添加地区失败:', error)
      ElMessage.error('添加地区失败: ' + error.message)
    }
  } finally {
    addRegionLoading.value = false
  }
}

// 修改地区信息
const handleEdit = (row) => {
  // 填充表单数据
  editRegionForm.id = row.id
  editRegionForm.regionName = row.regionName
  // 显示编辑弹窗
  editRegionVisible.value = true
}

// 提交编辑地区表单
const submitEditRegion = async () => {
  if (!editRegionFormRef.value) return

  try {
    // 表单校验
    await editRegionFormRef.value.validate()

    editRegionLoading.value = true

    // 获取表单数据
    const regionData = {
      regionId: editRegionForm.id,
      regionName: editRegionForm.regionName
    }
    // 调用API
    await saveOrUpdateRegion(regionData)

    ElMessage.success('地区更新成功')
    editRegionVisible.value = false
    await fetchRegions() // 刷新数据
  } finally {
    editRegionLoading.value = false
  }
}

// 删除地区
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该地区吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 获取地区ID
    const regionId = typeof row === 'object' ? row.id : row

    // 调用删除API
    await deleteRegionService(regionId)
    ElMessage.success('删除成功')
    await fetchRegions() // 重新获取数据
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel' && !error.toString().includes('cancel')) {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 处理API响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.regionId,
    regionName: item.regionName,
    regionCode: item.regionCode,
    createdAt: item.regionCreatedAt ? DateFormatter.format(item.regionCreatedAt) : '未知时间'
  }))
}

// 获取地区列表数据
const fetchRegions = async () => {
  tableLoading.value = true
  try {
    const response = await getRegionListService()
    const processedData = handleResponseData(response.data)
    originalData.value = processedData
    tableData.value = processedData
  } catch (error) {
    console.error('获取地区列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  fetchRegions()
})
</script>

<template>
  <div class="region-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddRegion" class="add-button">添加地区</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
          :data="tableData"
          v-loading="tableLoading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          border
          stripe
          highlight-current-row
      >
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="id" label="地区ID" width="190" align="center"/>
        <el-table-column prop="regionName" label="地区名称" min-width="150" align="center"/>
<!--        <el-table-column prop="regionCode" label="地区代码" width="120" align="center"/>-->
        <el-table-column prop="createdAt" label="更新时间" width="180" align="center"/>

        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <div class="operation-buttons-group">
              <el-button
                  type="warning"
                  size="small"
                  @click="handleEdit(scope.row)"
                  class="table-op-button edit-button"
              >修改
              </el-button>

              <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row)"
                  class="table-op-button delete-button"
              >删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加地区弹窗 -->
    <el-dialog
        v-model="addRegionVisible"
        title="添加地区"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <el-form
          ref="addRegionFormRef"
          :model="addRegionForm"
          :rules="addRegionRules"
          label-width="100px"
          label-position="right"
          status-icon
      >
        <el-form-item label="地区名称" prop="regionName">
          <el-input
              v-model="addRegionForm.regionName"
              placeholder="请输入地区名称"
          />
        </el-form-item>
<!--        <el-form-item label="地区代码" prop="regionCode">-->
<!--          <el-input-->
<!--              v-model="addRegionForm.regionCode"-->
<!--              placeholder="请输入地区代码"-->
<!--          />-->
<!--        </el-form-item>-->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addRegionVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddRegion" :loading="addRegionLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑地区弹窗 -->
    <el-dialog
        v-model="editRegionVisible"
        title="编辑地区"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <el-form
          ref="editRegionFormRef"
          :model="editRegionForm"
          :rules="editRegionRules"
          label-width="100px"
          label-position="right"
          status-icon
      >
        <el-form-item label="地区ID">
          <el-input v-model="editRegionForm.id" disabled/>
        </el-form-item>
        <el-form-item label="地区名称" prop="regionName">
          <el-input
              v-model="editRegionForm.regionName"
              placeholder="请输入地区名称"
          />
        </el-form-item>
<!--        <el-form-item label="地区代码" prop="regionCode">-->
<!--          <el-input-->
<!--              v-model="editRegionForm.regionCode"-->
<!--              placeholder="请输入地区代码"-->
<!--          />-->
<!--        </el-form-item>-->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editRegionVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditRegion" :loading="editRegionLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.region-container {
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-item label {
  margin-right: 8px;
  white-space: nowrap;
}

.operation-buttons {
  display: flex;
  align-items: center;
}

.add-button {
  background-color: #8f90ff;
  border-color: #8e8ff0;
  margin-right: 10px;
  font-size: 16px;
  padding: 12px 20px;
  height: auto;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.operation-buttons-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
}

.table-op-button {
  margin: 0;
  padding: 5px 0;
  height: 26px;
  line-height: 1;
  border-radius: 4px;
  font-size: 12px;
  width: 65px;
}

.edit-button {
  background-color: #ff9900;
  border-color: #ff9900;
}

.delete-button {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

:deep(.el-table th) {
  font-weight: bold;
}

.dialog-footer {
  text-align: right;
}
</style> 