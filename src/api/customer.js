import request from "../utils/request.js";

/**
 * 获取客户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.userId - 用户ID
 * @param {number} params.userStatus - 用户状态
 */
export const getCustomerList = (params) => {
  return request({
    url: "/customer/user",
    method: "get",
    params
  });
};

/**
 * 获取卡商列表
 */
export const getCardList = () => {
  return request({
    url: "/customer/adminUser",
    method: "get",
  });
};