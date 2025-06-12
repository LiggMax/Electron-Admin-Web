<script setup>
import {ref, reactive, onMounted, computed, nextTick} from 'vue'
import {ElMessageBox} from 'element-plus'
import {
  getRegionListService,
  deleteRegionService,
  saveOrUpdateRegion,
  updateRegionIcon
} from "../api/region.js";
import DateFormatter from "../utils/DateFormatter.js";
import Message from "../utils/message.js";

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

// 图标上传相关
const iconDialogVisible = ref(false)
const currentRegion = ref(null)
const iconLoading = ref(false)
const imageUrl = ref('')
const fileInput = ref(null)

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

    Message.success('地区添加成功')
    addRegionVisible.value = false
    await fetchRegions() // 刷新数据
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('添加地区失败:', error)
      Message.error('添加地区失败: ' + error.message)
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

    Message.success('地区更新成功')
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
    Message.success('删除成功')
    await fetchRegions() // 重新获取数据
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel' && !error.toString().includes('cancel')) {
      Message.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 打开上传图标弹窗
const uploadIcon = (row) => {
  currentRegion.value = row
  imageUrl.value = row.icon || ''
  iconDialogVisible.value = true
}

// 选择图片
const handleSelectFile = () => {
  fileInput.value.click()
}

// 图片变更处理
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 验证文件大小（限制为10MB）
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    Message.error('图片大小不能超过10MB')
    return
  }

  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    Message.error('只能上传图片文件')
    return
  }

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// 提交图标上传
const submitIconUpload = async () => {
  if (!imageUrl.value) {
    Message.warning('请先选择图片')
    return
  }

  if (!currentRegion.value) {
    Message.error('地区信息获取失败')
    return
  }

  if (!fileInput.value?.files[0]) {
    Message.error('请选择要上传的图片')
    return
  }

  try {
    iconLoading.value = true

    // 创建FormData对象
    const formData = new FormData()
    formData.append('regionId', currentRegion.value.id)
    formData.append('iconFile', fileInput.value.files[0])

    // 调用上传API
    await updateRegionIcon(formData)

    Message.success('图标上传成功')
    iconDialogVisible.value = false
    await fetchRegions() // 刷新数据
  } catch (error) {
    console.error('上传图标失败:', error)
  } finally {
    iconLoading.value = false
  }
}

// 取消图标上传
const cancelIconUpload = () => {
  iconDialogVisible.value = false
  imageUrl.value = ''
  currentRegion.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 处理API响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.regionId,
    regionName: item.regionName,
    regionCode: item.regionCode,
    icon: item.icon || '',
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
        <el-table-column prop="id" label="地区ID" width="80" align="center"/>
        <el-table-column prop="regionName" label="地区名称" min-width="120" align="center">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center; font-weight: bold">
              <img v-if="scope.row.icon" :src="scope.row.icon "
                   style="width: 28px; margin-right: 5px; border-radius: 4px;" alt="图标"/>
              <span style="font-size: 17px;font-weight: bold">{{ scope.row.regionName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center"/>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <div class="operation-buttons-group">
              <el-button
                  type="warning"
                  size="small"
                  @click="handleEdit(scope.row)"
                  class="table-op-button"
              >修改
              </el-button>

              <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row)"
                  class="table-op-button"
              >删除
              </el-button>
            </div>
            <div class="operation-buttons-group">
              <el-button
                  type="success"
                  size="small"
                  @click="uploadIcon(scope.row)"
                  class="table-op-button"
              >上传图标
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

    <!-- 图标上传弹窗 -->
    <el-dialog
        v-model="iconDialogVisible"
        title="上传地区图标"
        width="400px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @closed="cancelIconUpload"
    >
      <div class="icon-upload-container">
        <div class="region-info" v-if="currentRegion">
          <span class="region-name">{{ currentRegion.regionName }}</span>
        </div>

        <div class="icon-preview">
          <img v-if="imageUrl" :src="imageUrl" class="preview-image" alt="图标预览"/>
          <div v-else class="empty-preview">
            <i class="el-icon-picture-outline"></i>
            <span>暂无图片</span>
          </div>
        </div>

        <div class="upload-actions">
          <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
          />
          <el-button type="primary" @click="handleSelectFile">选择图片</el-button>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelIconUpload">取消</el-button>
          <el-button type="primary" @click="submitIconUpload" :loading="iconLoading">上传</el-button>
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
}

.table-op-button {
  margin: 5px;
  padding: 5px 0;
  height: 26px;
  line-height: 1;
  border-radius: 4px;
  font-size: 12px;
  width: 65px;
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

/* 图标上传相关样式 */
.icon-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.region-info {
  margin-bottom: 15px;
  text-align: center;
}

.region-name {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.icon-preview {
  width: 150px;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.empty-preview i {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-actions {
  margin-top: 10px;
}
</style>