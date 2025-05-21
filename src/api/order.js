import request from "../utils/request.js";

/**
 * 获取订单列表
 */
export const getOrderList = () => {
  return request({
    url: "/adminWeb/order",
    method: "get",
  });
};