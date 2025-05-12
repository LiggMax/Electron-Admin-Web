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
 * 获取卡商列表
 */
export const getCardList = () => {
  return request({
    url: "/customer/adminUser",
    method: "get",
  });
};

/**
 * 获取项目列表
 */
export const getProjectList = () => {
  return request({
    url: "/customer/project",
    method: "get",
  });
};