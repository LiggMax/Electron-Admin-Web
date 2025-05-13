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
