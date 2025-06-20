<script setup>
import {ref, reactive, onMounted, computed, nextTick} from 'vue'
import ElMessage from '../utils/message.js'
import {ElMessageBox, ElDropdown, ElDropdownMenu, ElDropdownItem} from 'element-plus'
import {Edit, Lock, Phone, Delete, ArrowDown, Wallet} from '@element-plus/icons-vue'
import {getCardList, editCard, resetPassword, addCard, deleteCardService, updateCardBalance} from "../api/card.js";
import DateFormatter from "../utils/DateFormatter.js";
import Message from "../utils/message.js";

// 查询条件
const queryForm = reactive({
  userId: '',
  account: ''
})

// 表格数据
const tableData = ref([])
const originalData = ref([]) // 保存原始数据，用于本地搜索
const tableLoading = ref(false)

// 处理本地搜索，根据查询条件过滤数据
const filteredData = computed(() => {
  if (!queryForm.userId && !queryForm.account) {
    return originalData.value
  }

  return originalData.value.filter(item => {
    const idMatch = !queryForm.userId || String(item.id).includes(queryForm.userId)
    const accountMatch = !queryForm.account || item.account.toLowerCase().includes(queryForm.account.toLowerCase())
    return idMatch && accountMatch
  })
})

// 选中的行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 搜索方法
const handleSearch = () => {
  // 本地搜索，不需要重新请求数据
  tableData.value = filteredData.value
}

// 重置搜索条件
const handleReset = () => {
  queryForm.userId = ''
  queryForm.account = ''
  tableData.value = originalData.value
}

// 添加卡商
const handleAddMerchant = () => {
  // 重置表单数据
  addCardForm.account = ''
  addCardForm.nickName = ''
  addCardForm.email = ''
  addCardForm.password = ''
  addCardForm.confirmPassword = ''

  // 显示添加卡商弹窗
  addCardVisible.value = true

  // 下一帧后重置表单校验结果
  nextTick(() => {
    addCardFormRef.value?.resetFields()
  })
}

// 清除选中的行
const handleClearSelected = () => {
  selectedRows.value = []
}

// 编辑卡商弹窗相关
const editDialogVisible = ref(false)
const editForm = reactive({
  id: '',
  name: '',
  account: '',
  email: '',
  divideInto: ''
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

// 添加卡商弹窗相关
const addCardVisible = ref(false)
const addCardForm = reactive({
  account: '',
  nickName: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const addCardLoading = ref(false)
const addCardFormRef = ref(null)

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
  name: [
    {required: true, message: '请输入卡商名称', trigger: 'blur'},
    {min: 1, max: 20, message: '名称长度需在1到20个字符之间', trigger: 'blur'}
  ],
  email: [
    {required: false, message: '请输入邮箱地址', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ],
  divideInto: [
    {required: true, message: '请输入分成比例', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入分成比例'))
        } else if (isNaN(Number(value))) {
          callback(new Error('分成比例必须是数字'))
        } else if (!Number.isInteger(Number(value))) {
          callback(new Error('分成比例必须是整数'))
        } else if (Number(value) < 0 || Number(value) > 100) {
          callback(new Error('分成比例必须在0-100之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 添加卡商表单验证规则
const addCardRules = {
  account: [
    {required: true, message: '请输入账号', trigger: 'blur'},
    {min: 6, max: 20, message: '账号长度需在6到20个字符之间', trigger: 'blur'},
    {pattern: /^[a-zA-Z\d]{6,20}$/, message: '账号只能包含字母和数字', trigger: 'blur'}
  ],
  nickName: [
    {required: true, message: '请输入昵称', trigger: 'blur'},
    {min: 1, max: 20, message: '昵称长度需在1到20个字符之间', trigger: 'blur'},
    {pattern: /^[a-zA-Z\d]{1,20}$/, message: '昵称只能包含字母和数字', trigger: 'blur'}
  ],
  email: [
    {required: false, message: '请输入邮箱地址', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度需在6到20个字符之间', trigger: 'blur'},
    {pattern: /^[a-zA-Z\d]{6,20}$/, message: '密码只能包含字母和数字', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== addCardForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 修改卡商信息
const handleEdit = (row) => {
  // 填充表单数据
  editForm.id = row.id
  editForm.name = row.name
  editForm.account = row.account
  editForm.email = row.email
  editForm.divideInto = row.divideInto

  // 显示编辑弹窗
  editDialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return

  try {
    // 表单校验
    await editFormRef.value.validate()

    editFormLoading.value = true

    // 准备请求数据
    const cardInfo = {
      userId: editForm.id,
      nickName: editForm.name,
      email: editForm.email,
      divideInto: editForm.divideInto
    }

    // 调用API
    await editCard(cardInfo);
    ElMessage.success('卡商信息更新成功')
    editDialogVisible.value = false
    await fetchMerchants() // 刷新数据
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('更新卡商信息失败:', error)
    }
  } finally {
    editFormLoading.value = false
  }
}

// 删除卡商
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该卡商吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const userId = row.id
    await deleteCardService(userId)
    ElMessage.success('删除成功')
    await fetchMerchants() // 重新获取数据
  } catch (error) {
    // 用户取消删除
  }
}

// 批量删除选中卡商
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的卡商')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个卡商吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    console.log('批量删除卡商:', selectedRows.value)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    await fetchMerchants()
  } catch (error) {
    // 用户取消删除
  }
}

// 处理卡商响应数据
const handleResponseData = (data) => {
  return data.map(item => ({
    id: item.userId,
    avatar: item.userAvatar,
    name: item.nickName || item.account,
    account: item.account,
    email: item.email,
    phoneNumber: item.phoneNumber || '未设置',
    divideInto: item.divideInto, // 分成比例
    money: item.money, //余额
    loginTime: item.loginTime ? DateFormatter.format(item.loginTime) : '暂无登录',
    rawLoginTime: item.loginTime,
    createdAt: DateFormatter.format(item.createdAt),
    updatedAt: item.updatedAt ? DateFormatter.format(item.updatedAt) : '暂无更新'
  }))
}

// 格式化分成比例显示
const formatDivideRatio = (ratio) => {
  if (ratio === null || ratio === undefined || ratio === '') {
    return '未设置'
  }
  const numRatio = Number(ratio)
  if (isNaN(numRatio)) {
    return '无效'
  }
  return `${numRatio}%`
}

// 根据分成比例获取颜色
const getRatioColor = (ratio) => {
  const numRatio = Number(ratio)
  if (isNaN(numRatio) || numRatio === 0) {
    return '#d9d9d9' // 灰色 - 未设置或0
  } else if (numRatio <= 30) {
    return '#52c41a' // 绿色 - 低比例
  } else if (numRatio <= 60) {
    return '#1890ff' // 蓝色 - 中等比例
  } else if (numRatio <= 80) {
    return '#fa8c16' // 橙色 - 较高比例
  } else {
    return '#f5222d' // 红色 - 高比例
  }
}

// 获取卡商列表数据
const fetchMerchants = async () => {
  tableLoading.value = true

  try {
    const response = await getCardList()
    const processedData = handleResponseData(response.data)
    originalData.value = processedData // 保存原始数据
    tableData.value = processedData
  } finally {
    tableLoading.value = false
  }
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

    // 准备请求数据
    const data = {
      userId: resetPasswordForm.userId,
      password: resetPasswordForm.password
    }

    // 调用API
    await resetPassword(data);
    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败，请稍后重试')
    }
  } finally {
    resetPasswordLoading.value = false
  }
}

// 提交添加卡商表单
const submitAddCard = async () => {
  if (!addCardFormRef.value) return

  try {
    // 表单校验
    await addCardFormRef.value.validate()

    addCardLoading.value = true

    // 准备请求数据 - 确保参数名符合后端接口
    const cardData = {
      account: addCardForm.account,
      password: addCardForm.password,
      nickName: addCardForm.nickName,
      email: addCardForm.email || '' // 确保即使email为空也传递空字符串
    }

    // 调用API
    await addCard(cardData)

    ElMessage.success('卡商添加成功')
    addCardVisible.value = false
    await fetchMerchants() // 刷新数据
  } catch (error) {
    if (error.message && !error.message.includes('验证未通过')) {
      console.error('添加卡商失败:', error)
      ElMessage.error('添加卡商失败: ' + error.message)
    }
  } finally {
    addCardLoading.value = false
  }
}

// 添加号码弹窗相关
const addPhoneVisible = ref(false)
const currentCard = reactive({
  id: '',
  name: '',
  account: '',
  phoneNumber: ''
})
const phoneFormLoading = ref(false)
const phoneForm = reactive({
  phoneNumber: '' // 单个号码输入
})

// 提现弹窗相关
const payoutsVisible = ref(false)
const payoutsForm = reactive({
  userId: '',
  username: '',
  currentBalance: 0,
  payoutAmount: '',
  bankInfo: {
    bankName: '',
    bankAccount: '',
    accountHolder: ''
  },
  alipayAccount: '',
  wechatAccount: '',
  remark: ''
})
const payoutsLoading = ref(false)
const payoutsFormRef = ref(null)

// 提现表单验证规则
const payoutsRules = {
  payoutAmount: [
    {required: true, message: '请输入提现金额', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (payoutsForm.currentBalance <= 0) {
          callback(new Error('当前余额不足，无法提现'))
        } else if (value === null || value === undefined || value === '') {
          callback(new Error('请输入提现金额'))
        } else if (isNaN(Number(value))) {
          callback(new Error('提现金额必须是数字'))
        } else if (Number(value) <= 0) {
          callback(new Error('提现金额必须大于0'))
        } else if (Number(value) > payoutsForm.currentBalance) {
          callback(new Error('提现金额不能大于当前余额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 添加号码
const handleAddPhone = (row) => {
  // 保存当前卡商信息
  currentCard.id = row.id
  currentCard.name = row.name
  currentCard.account = row.account
  currentCard.phoneNumber = row.phoneNumber

  // 如果已有号码，则预填充到表单
  phoneForm.phoneNumber = row.phoneNumber !== '未设置' ? row.phoneNumber : ''

  // 显示添加号码弹窗
  addPhoneVisible.value = true
}

// 提交添加号码表单
const submitPhoneForm = async () => {
  try {
    // 验证号码是否有效
    if (!phoneForm.phoneNumber.trim()) {
      ElMessage.warning('请输入有效的号码')
      return
    }

    phoneFormLoading.value = true
    const cardInfo = {
      userId: currentCard.id,
      phoneNumber: phoneForm.phoneNumber
    }
    await editCard(cardInfo)
    ElMessage.success('号码添加成功')
    addPhoneVisible.value = false
  } catch (error) {
    console.error('添加号码失败:', error)
  } finally {
    phoneFormLoading.value = false
  }
}

// 处理dropdown命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'addPhone':
      handleAddPhone(row)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'payouts':
      handlePayouts(row)
      break
    default:
      break
  }
}

// 处理提现
const handlePayouts = (row) => {
  // 检查余额是否足够
  if (row.money <= 0) {
    ElMessage.warning('该卡商余额不足，无法进行提现操作')
    return
  }
  
  // 填充提现表单数据
  payoutsForm.userId = row.id
  payoutsForm.username = row.name
  payoutsForm.currentBalance = row.money || 0
  payoutsForm.payoutAmount = ''
  payoutsForm.bankInfo.bankName = ''
  payoutsForm.bankInfo.bankAccount = ''
  payoutsForm.bankInfo.accountHolder = ''
  payoutsForm.alipayAccount = ''
  payoutsForm.wechatAccount = ''
  payoutsForm.remark = ''
  
  // 显示提现弹窗
  payoutsVisible.value = true
  
  // 下一帧后重置表单校验结果
  nextTick(() => {
    payoutsFormRef.value?.resetFields()
  })
}

// 提交提现表单
const submitPayouts = async () => {
  if (!payoutsFormRef.value) return
  
  try {
    // 表单校验
    await payoutsFormRef.value.validate()
    
    payoutsLoading.value = true
    
    // 准备请求数据
    const payoutData = {
      userId: payoutsForm.userId,
      balance: payoutsForm.payoutAmount,
      isType: false
    }
    
    await updateCardBalance(payoutData)
    
    Message.success('提现成功')
    payoutsVisible.value = false
    await fetchMerchants() // 刷新数据
  } finally {
    payoutsLoading.value = false
  }
}

// 设置提现金额（固定金额）
const setPayoutAmount = (amount) => {
  payoutsForm.payoutAmount = amount
}

// 判断是否选中了指定金额
const isSelectedAmount = (amount) => {
  return payoutsForm.payoutAmount === amount
}

onMounted(() => {
  fetchMerchants()
})
</script>

<template>
  <div class="merchant-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-form">
        <div class="form-item">
          <label>卡商ID:</label>
          <el-input v-model="queryForm.userId" placeholder="输入卡商ID" clearable/>
        </div>

        <div class="form-item">
          <label>账号:</label>
          <el-input v-model="queryForm.account" placeholder="请输入账号" class="account-input" clearable/>
        </div>

        <div class="form-item">
          <el-button type="primary" @click="handleSearch" class="search-button">查询</el-button>
          <el-button @click="handleReset" class="reset-button">重置</el-button>
        </div>
      </div>

      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddMerchant" class="add-button">添加卡商</el-button>
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

        <el-table-column label="卡商信息" width="150" align="center">
          <template #default="scope">
            <div class="merchant-avatar-name">
              <span class="merchant-avatar">
                <img v-if="scope.row.avatar" :src="scope.row.avatar" class="avatar-img" alt="头像"/>
                <span v-else class="default-avatar">{{ scope.row.name?.charAt(0)?.toUpperCase() || 'M' }}</span>
              </span>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="account" label="卡商账号" width="120" align="center"/>
        <el-table-column prop="divideInto" label="抽成比例" width="160" align="center">
          <template #default="scope">
            <div class="divide-ratio-cell">
              <el-progress
                  :percentage="scope.row.divideInto || 0"
                  :color="getRatioColor(scope.row.divideInto)"
                  :stroke-width="17"
                  :show-text="true"
                  :format="() => formatDivideRatio(scope.row.divideInto)"
                  class="ratio-progress"
              />
            </div>
          </template>
        </el-table-column>
        <!--余额-->
        <el-table-column prop="money" label="余额" width="120" align="center">
          <template #default="scope">
            <span class="money-value">￥{{ scope.row.money }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180" align="center">
          <template #default="scope">
            <span class="email-value">{{ scope.row.email ? scope.row.email : '未设置邮箱' }}</span>
          </template>
        </el-table-column>
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

        <el-table-column label="操作" fixed="right" width="120" align="center">
          <template #default="scope">
            <el-dropdown
                @command="(command) => handleCommand(command, scope.row)"
                size="large"
            >
              <el-button type="primary" size="small">
                操作
                <el-icon class="el-icon--right">
                  <ArrowDown/>
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="payouts">
                    <el-icon>
                      <Wallet/>
                    </el-icon>
                    余额提现
                  </el-dropdown-item>
                  <el-dropdown-item command="edit">
                    <el-icon>
                      <Edit/>
                    </el-icon>
                    修改
                  </el-dropdown-item>
                  <el-dropdown-item command="resetPassword">
                    <el-icon>
                      <Lock/>
                    </el-icon>
                    密码重置
                  </el-dropdown-item>
                  <el-dropdown-item command="addPhone">
                    <el-icon>
                      <Phone/>
                    </el-icon>
                    添加号码
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon>
                      <Delete/>
                    </el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑卡商弹窗 -->
    <el-dialog
        v-model="editDialogVisible"
        title="编辑卡商信息"
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
        <el-form-item label="卡商ID">
          <el-input v-model="editForm.id" disabled/>
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="editForm.account" disabled/>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入卡商名称"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"/>
        </el-form-item>
        <el-form-item label="抽成比例" prop="divideInto">
          <div class="divide-ratio-input">
            <div class="ratio-input-group">
              <el-input-number
                  v-model="editForm.divideInto"
                  :min="0"
                  :max="100"
                  :precision="0"
                  :step="1"
                  placeholder="请输入分成比例"
                  class="ratio-number-input"
              />
            </div>

            <div class="ratio-slider-container">
              <el-slider
                  v-model="editForm.divideInto"
                  :min="0"
                  :max="100"
                  :step="1"
                  :format-tooltip="(val) => `${val}%`"
                  show-stops
                  :marks="{
                  0: '0%',
                  25: '25%',
                  50: '50%',
                  75: '75%',
                  100: '100%'
                }"
                  class="ratio-slider"
              />
            </div>
          </div>
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
        <el-form-item label="卡商ID">
          <el-input v-model="resetPasswordForm.userId" disabled/>
        </el-form-item>
        <el-form-item label="卡商名称">
          <el-input v-model="resetPasswordForm.username" disabled/>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
              v-model="resetPasswordForm.password"
              placeholder="请输入新密码，6-16个字符"
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

    <!-- 添加卡商弹窗 -->
    <el-dialog
        v-model="addCardVisible"
        title="添加卡商"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <el-form
          ref="addCardFormRef"
          :model="addCardForm"
          :rules="addCardRules"
          label-width="100px"
          label-position="right"
          status-icon
      >
        <el-form-item label="昵称" prop="nickName">
          <el-input
              v-model="addCardForm.nickName"
              placeholder="请输入昵称，1-20个字符"
          />
        </el-form-item>

        <el-form-item label="账号" prop="account">
          <el-input
              v-model="addCardForm.account"
              placeholder="请输入账号，6-20个字符"
              autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="addCardForm.password"
              placeholder="请输入密码，6-20个字符"
              show-password
              autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="addCardForm.confirmPassword"
              placeholder="请再次输入密码"
              show-password
              autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="addCardForm.email"
              placeholder="请输入邮箱，非必填"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addCardVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddCard" :loading="addCardLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加号码弹窗 -->
    <el-dialog
        v-model="addPhoneVisible"
        title="号码管理"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <div class="card-info">
        <div class="info-item">
          <span class="label">卡商ID:</span>
          <span class="value">{{ currentCard.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">卡商名称:</span>
          <span class="value">{{ currentCard.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">账号:</span>
          <span class="value">{{ currentCard.account }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前号码:</span>
          <span class="value" :class="{'no-data': currentCard.phoneNumber === '未设置'}">
            {{ currentCard.phoneNumber }}
          </span>
        </div>
      </div>
      
      <div class="phone-form">
        <el-form label-width="80px">
          <el-form-item label="号码">
            <el-input 
                v-model="phoneForm.phoneNumber" 
                placeholder="请输入号码" 
                maxlength="11"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addPhoneVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPhoneForm" :loading="phoneFormLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 提现弹窗 -->
    <el-dialog
        v-model="payoutsVisible"
        title="余额提现"
        width="600px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <div class="payout-info">
        <div class="info-item">
          <span class="label">卡商ID:</span>
          <span class="value">{{ payoutsForm.userId }}</span>
        </div>
        <div class="info-item">
          <span class="label">卡商名称:</span>
          <span class="value">{{ payoutsForm.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前余额:</span>
          <span class="value balance-value">￥{{ payoutsForm.currentBalance.toFixed(2) }}</span>
          <span v-if="payoutsForm.payoutAmount > 0" class="remaining-balance">
            → 提现后余额: ￥{{ (payoutsForm.currentBalance - (payoutsForm.payoutAmount || 0)).toFixed(2) }}
          </span>
        </div>
      </div>

      <el-form 
          ref="payoutsFormRef"
          :model="payoutsForm" 
          :rules="payoutsRules"
          label-width="100px" 
          label-position="right"
          status-icon
      >
        <el-form-item label="提现金额" prop="payoutAmount">
          <el-input-number
              v-model="payoutsForm.payoutAmount"
              :min="Math.min(0, payoutsForm.currentBalance)"
              :max="payoutsForm.currentBalance"
              :precision="2"
              :step="1"
              placeholder="请输入提现金额"
              style="width: 100%"
              :disabled="payoutsForm.currentBalance <= 0"
          />
          
          <!-- 固定金额选项按钮 -->
          <div class="amount-options">
            <span class="options-label">快速选择:</span>
            <div class="amount-buttons">
              <el-button 
                v-for="amount in [10, 30, 50, 100, 200, 500]"
                :key="amount"
                size="small" 
                @click="setPayoutAmount(amount)"
                :type="isSelectedAmount(amount) ? 'primary' : 'default'"
                :disabled="amount > payoutsForm.currentBalance"
              >
                ￥{{ amount }}
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="payoutsVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPayouts" :loading="payoutsLoading">确定提现</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.merchant-container {
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

.money-value {
  font-weight: bold;
  color: #f56c6c;
}

.form-item label {
  margin-right: 8px;
  white-space: nowrap;
}

.account-input {
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

.merchant-avatar-name {
  display: flex;
  align-items: center;
}

.merchant-avatar {
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

.reset-button {
  background-color: #409eff;
  border-color: #409eff;
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

.no-login {
  color: #909399;
  font-style: italic;
}

.relative-time {
  color: #409EFF;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.card-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  color: #606266;
  margin-right: 10px;
  display: inline-block;
  width: 80px;
}

.value {
  color: #303133;
}

.phone-form {
  margin-bottom: 20px;
}

.no-data {
  color: #909399;
  font-style: italic;
}

.payout-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.balance-value {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.remaining-balance {
  color: #409eff;
  font-size: 14px;
  margin-left: 10px;
  font-weight: bold;
}

.amount-options {
  margin-top: 10px;
}

.options-label {
  font-size: 14px;
  color: #606266;
  display: block;
  margin-bottom: 8px;
}

.amount-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.divide-ratio-cell {
  width: 100%;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ratio-progress {
  width: 100%;
  margin-bottom: 4px;
}

.divide-ratio-input {
  width: 100%;
}

.ratio-input-group {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 15px;
}

.ratio-number-input {
  width: 100% !important;
}


.ratio-slider-container {
  margin: 15px 0;
  padding: 0 10px;
}

.ratio-slider {
  width: 100%;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .divide-ratio-cell {
    padding: 2px 4px;
    gap: 2px;
  }

  .ratio-slider-container {
    margin: 10px 0;
    padding: 0 5px;
  }

}
</style>