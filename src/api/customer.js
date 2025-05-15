import request from "../utils/request.js";

/**
 * 获取客户列表
 */
export const getCustomerList = (params) => {
  return request({
    url: "/customer/user",
    method: "get",
    params
  });
};

/**
 * 更新客户状态
 */
export const updateCustomerStatus = (data) => {
  return request({
    url: "/customer/status",
    method: "put",
    params: data
  });
};

/**
 * 编辑客户信息
 */
export const updateCustomerInfo = (data) => {
  return request({
    url: "/customer/edit",
    method: "put",
    data
  });
};

/**
 * 重置密码
 */
export const resetPasswordService = (data) => {
  return request({
    url: "/customer/reset",
    method: "put",
    params: data
  });
};

/**
 * 添加客户
 */
export const addCustomerService = (data) => {
  return request({
    url: "/customer/addUser",
    method: "post",
    params: data
  });
};