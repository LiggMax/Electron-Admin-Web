<script setup>
import {ref, reactive, onMounted, nextTick} from 'vue'
import ElMessage from '../utils/message.js'
import {ElMessageBox} from 'element-plus'
import {ArrowDown,Wallet, Edit, Lock, Delete} from '@element-plus/icons-vue'
import {
  addCustomerService, deleteCustomerService,
  getCustomerList, resetPasswordService, updateBalanceService, updateCustomerInfo,
  updateCustomerStatus
} from '../api/customer.js'
import DateFormatter from '../utils/DateFormatter.js'
import Message from "../utils/message.js";

// 查询条件
const queryForm = reactive({
  userId: '',
  userStatus: ''
})

// 客户状态选项
const statusOptions = [
  {label: '请选择客户状态', value: ''},
  {label: '正常', value: 1},
  {label: '停用', value: 0}
]

// 表格数据
const tableData = ref([])
const tableLoading = ref(false)

// 编辑弹窗相关
const editDialogVisible = ref(false)
const editForm = reactive({
  id: '',
  name: '',
  account: '',
  email: '',
  status: true,
  money: 0
})
const editFormLoading = ref(false)
const editFormRef = ref(null)

// 重置密码弹窗相关
const resetPasswordVisible = ref(false)
const resetPasswordForm = reactive({
  userId: '',
  username: '',
  password: '',
  confirmPassword: ''
})
const resetPasswordLoading = ref(false)
const resetPasswordFormRef = ref(null)

// 添加客户弹窗相关
const addCustomerVisible = ref(false)
const addCustomerForm = reactive({
  account: '',
  nickName: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const addCustomerLoading = ref(false)
const addCustomerFormRef = ref(null)

// 余额修改弹窗相关
const editBalanceVisible = ref(false)
const editBalanceForm = reactive({
  userId: '',
  username: '',
  currentBalance: 0,
  newBalance: 0,
  userAvatar: '',
  amount: 0,
  remark: '',
  customAmount: '', // 添加自定义金额字段
  showCustomInput: false, // 控制自定义金额输入框显示
  operationType: 'add' // 操作类型：'add' 充值, 'subtract' 扣款
})
const editBalanceLoading = ref(false)
const editBalanceFormRef = ref(null)

// 添加金额选项数据模型
const addAmountOptions = [
  {value: 5, label: '￥5'},
  {value: 10, label: '￥10'},
  {value: 20, label: '￥20'},
  {value: 30, label: '￥30'},
  {value: 50, label: '￥50'},
  {value: 100, label: '￥100'},
  {value: 200, label: '￥200'},
  {value: 300, label: '￥300'},
]
//减少金额选项数据模型
const subtractAmountOptions = [
  {value: 5, label: '￥5'},
  {value: 10, label: '￥10'},
  {value: 20, label: '￥20'},
  {value: 30, label: '￥30'},
  {value: 50, label: '￥50'},
  {value: 100, label: '￥100'},
  {value: 200, label: '￥200'},
  {value: 300, label: '￥300'},
]

// 重置密码表单验证规则
const resetPasswordRules = {
  password: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, max: 16, message: '密码长度需在6到16个字符之间', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请确认新密码', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 表单验证规则
const editRules = {
  email: [
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ],
  name: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 1, max: 20, message: '用户名长度需在1到20个字符之间', trigger: 'blur'}
  ],
  money: [
    {required: true, message: '请输入余额', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (isNaN(value) || value === '') {
          callback(new Error('余额必须是数字'));
        } else if (parseFloat(value) < 0) {
          callback(new Error('余额不能为负数'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
}

// 添加客户表单验证规则
const addCustomerRules = {
  account: [
    {required: true, message: '请输入账号', trigger: 'blur'},
    {min: 4, max: 20, message: '账号长度需在4到20个字符之间', trigger: 'blur'}
  ],
  nickName: [
    {required: true, message: '请输入昵称', trigger: 'blur'},
    {min: 1, max: 20, message: '昵称长度需在1到20个字符之间', trigger: 'blur'}
  ],
  email: [
    {required: false, message: '请输入邮箱地址', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 16, message: '密码长度需在6到16个字符之间', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== addCustomerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [5, 10, 20, 50]
})

// 选中的行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 处理下拉菜单命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'editBalance':
      handleEditBalance(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'delete':
      handleDelete(row)
      break
    default:
      break
  }
}

// 搜索方法
const handleSearch = () => {
  pagination.currentPage = 1
  fetchCustomers()
}

// 重置搜索条件
const handleReset = () => {
  queryForm.userId = ''
  queryForm.userStatus = ''
  pagination.currentPage = 1
  fetchCustomers()
}

// 添加客户
const handleAddCustomer = () => {
  // 重置表单数据
  addCustomerForm.account = ''
  addCustomerForm.nickName = ''
  addCustomerForm.email = ''
  addCustomerForm.password = ''
  addCustomerForm.confirmPassword = ''

  // 显示添加客户弹窗
  addCustomerVisible.value = true

  // 下一帧后重置表单校验结果
  nextTick(() => {
    addCustomerFormRef.value?.resetFields()
  })
}


// 清除选中的行
const handleClearSelected = () => {
  selectedRows.value = []
}

// 修改客户信息
const handleEdit = (row) => {
  // 填充表单数据
  editForm.id = row.id
  editForm.name = row.name
  editForm.account = row.account
  editForm.email = row.email
  editForm.status = row.status
  editForm.money = row.money

  // 显示编辑弹窗
  editDialogVisible.value = true
}

// 处理余额修改
const handleEditBalance = (row) => {
  // 填充表单数据
  editBalanceForm.userId = row.id
  editBalanceForm.username = row.name
  editBalanceForm.currentBalance = row.money
  editBalanceForm.newBalance = row.money
  editBalanceForm.userAvatar = row.avatar
  editBalanceForm.amount = 0
  editBalanceForm.remark = ''
  editBalanceForm.customAmount = '' // 重置自定义金额
  editBalanceForm.showCustomInput = false // 隐藏自定义输入框
  editBalanceForm.operationType = 'add' // 默认为充值

  // 显示余额修改弹窗
  editBalanceVisible.value = true

  // 下一帧后重置表单校验结果
  nextTick(() => {
    editBalanceFormRef.value?.resetFields()
  })
}

// 设置快速金额 - 修改为支持操作类型
const setQuickAmount = (amount, type = 'add') => {
  editBalanceForm.amount = amount
  editBalanceForm.operationType = type
  editBalanceForm.customAmount = '' // 清空自定义金额
  editBalanceForm.showCustomInput = false // 隐藏自定义输入框
}

// 显示自定义金额输入框 - 修改为支持操作类型
const showCustomAmountInput = (type = 'add') => {
  editBalanceForm.showCustomInput = true
  editBalanceForm.operationType = type
  editBalanceForm.amount = 0 // 清空快速选择的金额
  nextTick(() => {
    // 聚焦到自定义金额输入框
    const customInput = document.querySelector('.custom-amount-input input')
    if (customInput) {
      customInput.focus()
    }
  })
}

// 设置自定义金额
const setCustomAmount = () => {
  const customValue = parseFloat(editBalanceForm.customAmount)
  if (!isNaN(customValue) && customValue > 0) {
    editBalanceForm.amount = customValue
    ElMessage.success(`已设置自定义金额：￥${customValue}`)
  } else {
    ElMessage.warning('请输入有效的金额')
  }
}

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return

  try {
    // 表单校验
    await editFormRef.value.validate()

    editFormLoading.value = true
    const userInfo = {
      userId: editForm.id,
      nickName: editForm.name,
      email: editForm.email,
      status: editForm.status,
      money: parseFloat(editForm.money) // 添加余额更新
    }
    // TODO: 调用API更新客户信息
    await updateCustomerInfo(userInfo)

    ElMessage.success('用户信息更新成功')
    editDialogVisible.value = false
    await fetchCustomers() // 刷新数据
  } catch (error) {
    if (error.message) {
      console.error('更新用户信息失败:', error)
      ElMessage.error('更新用户信息失败: ' + error.message)
    }
  } finally {
    editFormLoading.value = false
  }
}

// 修改状态
const handleToggleStatus = async (row) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
        `确定要${row.status ? '启用' : '停用'}用户 "${row.name}" 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: row.status ? 'success' : 'warning'
        }
    )

    // 设置加载状态
    row.statusLoading = true

    // 准备请求数据
    const data = {
      userId: row.id,
      status: row.status
    }

    // 调用API
    const response = await updateCustomerStatus(data)

    if (response.code === 200) {
      ElMessage.success(`已${row.status ? '启用' : '停用'}用户: ${row.name}`)
    } else {
      // 如果API调用失败，恢复状态并显示错误消息
      row.status = !row.status
      ElMessage.error(response.message || `更新用户状态失败`)
    }
  } catch (error) {
    // 判断是否是用户取消操作
    if (error === 'cancel' || error.toString().includes('cancel')) {
      // 用户取消操作，恢复开关状态
      row.status = !row.status
      return
    }

    // 发生错误时恢复状态
    row.status = !row.status
    console.error('更新用户状态失败:', error)
    ElMessage.error('更新用户状态失败，请稍后重试')
  } finally {
    // 无论成功失败，都关闭加载状态
    row.statusLoading = false
  }
}

// 删除客户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const userId = row.id
    await deleteCustomerService(userId)
    ElMessage.success('删除成功')
    await fetchCustomers()
  } catch (error) {
    // 用户取消删除
  }
}

// 批量删除选中客户
const handleBatchDelete = async () => {
  // 批量删除逻辑
}

// 处理API响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.userId,
    avatar: item.userAvatar,
    name: item.nickName || item.account,
    account: item.account,
    email: item.email,
    money: item.money,
    loginTime: item.loginTime ? DateFormatter.format(item.loginTime) : '暂无登录',
    rawLoginTime: item.loginTime, // 保存原始登录时间用于计算相对时间
    createdAt: DateFormatter.format(item.createdAt),
    updatedAt: item.updatedAt ? DateFormatter.format(item.updatedAt) : '暂无更新',
    status: item.userStatus === 1,
    statusLoading: false // 添加状态加载标识
  }))
}

// 获取客户列表数据
const fetchCustomers = async () => {
  tableLoading.value = true

  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      userId: queryForm.userId,
      userStatus: queryForm.userStatus
    }

    const response = await getCustomerList(params)

    tableData.value = handleResponseData(response.data)
    pagination.total = response.data.length
  } catch (error) {
    console.error('获取用户列表失败:', error)
    tableData.value = []
    pagination.total = 0
  } finally {
    tableLoading.value = false
  }
}

// 页码变化
const handleCurrentChange = () => {
  fetchCustomers()
}

// 每页条数变化
const handleSizeChange = () => {
  pagination.currentPage = 1
  fetchCustomers()
}

// 重置密码
const handleResetPassword = (row) => {
  resetPasswordForm.userId = row.id
  resetPasswordForm.username = row.name
  resetPasswordForm.password = ''
  resetPasswordForm.confirmPassword = ''
  resetPasswordVisible.value = true
}

// 提交重置密码
const submitResetPassword = async () => {
  if (!resetPasswordFormRef.value) return

  try {
    // 表单校验
    await resetPasswordFormRef.value.validate()

    resetPasswordLoading.value = true

    const resetPassword = {
      userId: resetPasswordForm.userId,
      password: resetPasswordForm.password
    }
    await resetPasswordService(resetPassword)

    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('重置密码失败:', error)
    }
  } finally {
    resetPasswordLoading.value = false
  }
}

// 提交添加客户表单
const submitAddCustomer = async () => {
  if (!addCustomerFormRef.value) return

  try {
    // 表单校验
    await addCustomerFormRef.value.validate()

    addCustomerLoading.value = true

    const addCustomer = {
      account: addCustomerForm.account,
      nickName: addCustomerForm.nickName,
      password: addCustomerForm.password,
      email: addCustomerForm.email,
    }
    await addCustomerService(addCustomer)

    ElMessage.success('客户添加成功')
    addCustomerVisible.value = false
    await fetchCustomers() // 刷新数据
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('添加客户失败:', error)
    }
  } finally {
    addCustomerLoading.value = false
  }
}

// 提交余额修改表单
const submitEditBalance = async () => {
  if (!editBalanceFormRef.value) return

  // 检查是否选择了金额
  if (editBalanceForm.amount <= 0) {
    ElMessage.warning('请选择或输入金额')
    return
  }

  try {
    // 表单校验
    await editBalanceFormRef.value.validate()

    editBalanceLoading.value = true

    // 根据操作类型计算新余额
    let newBalance
    let operationText
    if (editBalanceForm.operationType === 'add') {
      newBalance = editBalanceForm.currentBalance + editBalanceForm.amount
      operationText = '充值'
    } else {
      newBalance = editBalanceForm.currentBalance - editBalanceForm.amount
      operationText = '扣款'
      
      // 检查余额是否足够
      if (newBalance < 0) {
        ElMessage.error('余额不足，无法进行扣款操作')
        return
      }
    }

    // 准备更新数据
    const updateData = {
      userId: editBalanceForm.userId,
      balance: parseFloat(editBalanceForm.amount),
      isType: editBalanceForm.operationType === 'add'
    }

    // 调用API更新余额
    await updateBalanceService(updateData)

    Message.success(`${operationText}成功！${operationText}金额：￥${editBalanceForm.amount}，新余额：￥${newBalance}`)
    editBalanceVisible.value = false
    await fetchCustomers() // 刷新数据
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('修改余额失败:', error)
      ElMessage.error('修改余额失败: ' + (error.message || '未知错误'))
    }
  } finally {
    editBalanceLoading.value = false
  }
}

onMounted(() => {
  fetchCustomers()
})
</script>

<template>
  <div class="customer-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-form">
        <div class="form-item">
          <label>用户ID:</label>
          <el-input v-model="queryForm.userId" placeholder="输入用户ID" clearable/>
        </div>

        <div class="form-item">
          <label>用户状态:</label>
          <el-select v-model="queryForm.userStatus" placeholder="请选择用户状态" class="status-select">
            <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <el-button type="primary" @click="handleSearch" class="search-button">查询</el-button>
          <el-button @click="handleReset" class="reset-button">重置</el-button>
        </div>
      </div>

      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddCustomer" class="add-button">添加客户</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <div class="selected-info" v-if="selectedRows.length > 0">
        <el-alert type="info" :closable="false">
          <template #default>
            <div class="selected-text">
              已选择 {{ selectedRows.length }} 项
              <div>
                <el-button type="danger" size="small" @click="handleBatchDelete" class="batch-delete-button">删除
                </el-button>
                <span class="clear-text" @click="handleClearSelected">清除</span>
              </div>
            </div>
          </template>
        </el-alert>
      </div>

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

        <el-table-column label="客戶信息" width="150" align="center">
          <template #default="scope">
            <div class="customer-avatar-name">
              <span class="customer-avatar">
                <img v-if="scope.row.avatar" :src="scope.row.avatar" class="avatar-img" alt="头像"/>
                <span v-else class="default-avatar">{{ scope.row.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
              </span>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="账号" width="120" align="center"/>
        <el-table-column prop="money" label="余额" width="100" align="center">
          <template #default="scope">
            <span class="money-value">￥{{ scope.row.money }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                @change="() => handleToggleStatus(scope.row)"
                inactive-color="#dcdfe6"
                active-color="#409eff"
                :loading="scope.row.statusLoading"
                :disabled="scope.row.statusLoading"
                :active-value="true"
                :inactive-value="false"
            />
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="150" align="center"/>
        <el-table-column prop="loginTime" label="登录时间" width="180" align="center">
          <template #default="scope">
            <span :class="{'no-login': scope.row.loginTime === '暂无登录'}">
              {{ scope.row.loginTime }}
              <span v-if="scope.row.loginTime !== '暂无登录'" class="relative-time">
                ({{ DateFormatter.relativeTime(scope.row.rawLoginTime) }})
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" align="center"/>
        <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
          <template #default="scope">
            {{ scope.row.updatedAt || '暂无更新' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="90" align="center">
          <template #default="scope">
            <el-dropdown @command="(command) => handleCommand(command, scope.row)"
                         trigger="hover"
                          size="large">
              <el-button type="primary" size="small">
                操作
                <el-icon>
                  <ArrowDown/>
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="editBalance">
                    <el-icon>
                      <Wallet/>
                    </el-icon>
                    <span>余额修改</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="edit">
                    <el-icon>
                      <Edit/>
                    </el-icon>
                    <span>信息修改</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="resetPassword">
                    <el-icon>
                      <Lock/>
                    </el-icon>
                    <span>重置密码</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon>
                      <Delete/>
                    </el-icon>
                    <span>删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="pagination.pageSizes"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
            small
        />
      </div>
    </div>

    <!-- 编辑用户弹窗 -->
    <el-dialog
        v-model="editDialogVisible"
        title="编辑用户信息"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="80px"
          label-position="right"
          status-icon
      >
        <el-form-item label="用户ID">
          <el-input v-model="editForm.id" disabled/>
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="editForm.account" disabled/>
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
              v-model="editForm.status"
              :active-value="true"
              :inactive-value="false"
              active-text="启用"
              inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm" :loading="editFormLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog
        v-model="resetPasswordVisible"
        title="重置密码"
        width="450px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <el-form
          ref="resetPasswordFormRef"
          :model="resetPasswordForm"
          :rules="resetPasswordRules"
          label-width="100px"
          label-position="right"
          status-icon
      >
        <el-form-item label="用户ID">
          <el-input v-model="resetPasswordForm.userId" disabled/>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="resetPasswordForm.username" disabled/>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
              v-model="resetPasswordForm.password"
              placeholder="请输入新密码"
              show-password
              autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="resetPasswordForm.confirmPassword"
              placeholder="请再次输入新密码"
              show-password
              autocomplete="new-password"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPassword" :loading="resetPasswordLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加客户弹窗 -->
    <el-dialog
        v-model="addCustomerVisible"
        title="添加客户"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <el-form
          ref="addCustomerFormRef"
          :model="addCustomerForm"
          :rules="addCustomerRules"
          label-width="100px"
          label-position="right"
          status-icon
      >
        <el-form-item label="账号" prop="account">
          <el-input
              v-model="addCustomerForm.account"
              placeholder="请输入账号，4-20个字符"
              autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input
              v-model="addCustomerForm.nickName"
              placeholder="请输入昵称，1-20个字符"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="addCustomerForm.password"
              placeholder="请输入密码，6-16个字符"
              show-password
              autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="addCustomerForm.confirmPassword"
              placeholder="请再次输入密码"
              show-password
              autocomplete="new-password"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addCustomerVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddCustomer" :loading="addCustomerLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 余额修改弹窗 -->
    <el-dialog
        v-model="editBalanceVisible"
        title="余额修改"
        width="520px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <div class="balance-dialog-header">
        <div class="user-info-card">
          <el-icon class="user-icon">
            <Wallet/>
          </el-icon>
          <div class="user-details">
            <div class="username">
              <img :src="editBalanceForm.userAvatar" style="width: 25px;border-radius: 50px" alt="">
              {{ editBalanceForm.username }}
            </div>
            <div class="user-id">用户ID: {{ editBalanceForm.userId }}</div>
          </div>
          <div class="current-balance">
            <div class="balance-label">
              <span v-if="editBalanceForm.amount > 0">
                {{ editBalanceForm.operationType === 'add' ? '充值后余额' : '扣款后余额' }}
              </span>
              <span v-else>当前余额</span>
            </div>
            <div class="balance-amount">
              <span v-if="editBalanceForm.amount > 0" class="original-balance">
                ￥{{ editBalanceForm.currentBalance }}
              </span>
              <span v-if="editBalanceForm.amount > 0" class="operation-arrow">
                {{ editBalanceForm.operationType === 'add' ? '+' : '-' }}{{ editBalanceForm.amount }}
              </span>
              <span v-if="editBalanceForm.amount > 0" class="arrow-symbol">→</span>
              <span class="new-balance" :class="{ 
                'text-success': editBalanceForm.amount > 0 && editBalanceForm.operationType === 'add', 
                'text-danger': editBalanceForm.amount > 0 && editBalanceForm.operationType === 'subtract',
                'current-only': editBalanceForm.amount === 0
              }">
                ￥{{ editBalanceForm.amount > 0 ? 
                  (editBalanceForm.operationType === 'add' ? 
                    (editBalanceForm.currentBalance + editBalanceForm.amount) : 
                    (editBalanceForm.currentBalance - editBalanceForm.amount)
                  ) : editBalanceForm.currentBalance }}
              </span>
            </div>
            <div v-if="editBalanceForm.amount > 0" class="operation-tag">
              <el-tag :type="editBalanceForm.operationType === 'add' ? 'success' : 'danger'" size="small">
                {{ editBalanceForm.operationType === 'add' ? '充值' : '扣款' }} ￥{{ editBalanceForm.amount }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <el-form
          ref="editBalanceFormRef"
          :model="editBalanceForm"
          :rules="editRules"
          label-width="100px"
          label-position="right"
          status-icon
      >
        <el-form-item label="充值" prop="amount">
          <!-- 快速充值选项 -->
          <div class="quick-amount-buttons">
            <el-button
                v-for="option in addAmountOptions"
                :key="option.value"
                size="small"
                type="primary"
                plain
                @click="setQuickAmount(option.value, 'add')"
                :class="{ 'is-active': editBalanceForm.amount === option.value && editBalanceForm.operationType === 'add' }"
            >
              +{{ option.label }}
            </el-button>
            <!-- 自定义金额按钮 -->
            <el-button
                size="small"
                type="primary"
                plain
                @click="showCustomAmountInput('add')"
                :class="{ 'is-active': editBalanceForm.showCustomInput && editBalanceForm.operationType === 'add' }"
            >
              自定义金额
            </el-button>
          </div>

          <!-- 自定义金额输入区域 -->
          <div v-if="editBalanceForm.showCustomInput && editBalanceForm.operationType === 'add'" class="custom-amount-section">
            <div class="custom-amount-input-wrapper">
              <el-input
                  v-model="editBalanceForm.customAmount"
                  placeholder="请输入自定义金额"
                  type="number"
                  class="custom-amount-input"
                  size="small"
                  :min="0.01"
                  :step="0.01"
                  @keyup.enter="setCustomAmount"
              >
                <template #prepend>￥</template>
              </el-input>
              <el-button
                  type="primary"
                  size="small"
                  @click="setCustomAmount"
                  class="confirm-custom-btn"
              >
                确认
              </el-button>
            </div>
          </div>
        </el-form-item>

        <!--扣款-->
        <el-form-item label="扣款" prop="amount">
          <!-- 快速扣款选项 -->
          <div class="quick-amount-buttons">
            <el-button
                v-for="option in subtractAmountOptions"
                :key="option.value"
                size="small"
                type="danger"
                plain
                @click="setQuickAmount(option.value, 'subtract')"
                :class="{ 'is-active': editBalanceForm.amount === option.value && editBalanceForm.operationType === 'subtract' }"
            >
              -{{ option.label }}
            </el-button>
            <!-- 自定义金额按钮 -->
            <el-button
                size="small"
                type="danger"
                plain
                @click="showCustomAmountInput('subtract')"
                :class="{ 'is-active': editBalanceForm.showCustomInput && editBalanceForm.operationType === 'subtract' }"
            >
              自定义金额
            </el-button>
          </div>

          <!-- 自定义金额输入区域 -->
          <div v-if="editBalanceForm.showCustomInput && editBalanceForm.operationType === 'subtract'" class="custom-amount-section">
            <div class="custom-amount-input-wrapper">
              <el-input
                  v-model="editBalanceForm.customAmount"
                  placeholder="请输入自定义金额"
                  type="number"
                  class="custom-amount-input"
                  size="small"
                  :min="0.01"
                  :step="0.01"
                  @keyup.enter="setCustomAmount"
              >
                <template #prepend>￥</template>
              </el-input>
              <el-button
                  type="primary"
                  size="small"
                  @click="setCustomAmount"
                  class="confirm-custom-btn"
              >
                确认
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editBalanceVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitEditBalance" 
            :loading="editBalanceLoading"
            :disabled="editBalanceForm.amount <= 0"
          >
            <span v-if="editBalanceForm.amount <= 0">请选择金额</span>
            <span v-else-if="editBalanceForm.operationType === 'add'">确认充值</span>
            <span v-else-if="editBalanceForm.operationType === 'subtract'">确认扣款</span>
            <span v-else>确认操作</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.customer-container {
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

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 10px;
}

.form-item label {
  margin-right: 8px;
  white-space: nowrap;
}

.status-select {
  width: 180px;
}

.operation-buttons {
  display: flex;
  align-items: center;
}

.add-button {
  background-color: #8e8ff0;
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

.selected-info {
  margin-bottom: 10px;
}

.selected-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.clear-text {
  color: #409eff;
  cursor: pointer;
  margin-left: 10px;
}

.batch-delete-button {
  padding: 2px 8px;
  height: 24px;
  line-height: 20px;
}

.customer-avatar-name {
  display: flex;
  align-items: center;
}

.customer-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f7fa;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.no-login {
  color: #909399;
  font-style: italic;
}

.relative-time {
  color: #409EFF;
  font-size: 12px;
  margin-left: 5px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 10px 0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

.dialog-footer {
  text-align: right;
}

.money-value {
  font-weight: bold;
  color: #f56c6c;
}

/* 余额修改弹窗样式 */
.balance-dialog-header {
  margin-bottom: 20px;
}

.user-info-card {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.user-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.user-id {
  color: #909399;
  font-size: 12px;
}

.current-balance {
  text-align: right;
}

.balance-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.balance-amount {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.original-balance {
  color: #909399;
  font-size: 14px;
  text-decoration: line-through;
}

.operation-arrow {
  color: #409eff;
  font-size: 14px;
  font-weight: normal;
}

.arrow-symbol {
  color: #909399;
  font-size: 14px;
}

.new-balance {
  font-size: 18px;
  font-weight: bold;
}

.current-only {
  color: #67c23a;
}

.operation-tag {
  margin-top: 8px;
}

/* 余额修改弹窗样式 */
.custom-amount-section {
  margin-bottom: 10px;
}

.custom-amount-input-wrapper {
  display: flex;
  align-items: center;
}

.custom-amount-input {
  width: 100%;
}

.confirm-custom-btn {
  margin-left: 5px;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

</style>