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
    url: "/customer",
    method: "put",
    data
  });
};