import request from "../utils/request.js";

/**
 * 获取客户列表
 */
export const getCustomerList = () => {
  return request({
    url: "/customer",
    method: "get",
  });
};