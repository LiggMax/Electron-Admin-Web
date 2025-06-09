import request from "../utils/request.js";

/**
 * 获取订单列表
 */
export const getOrderList = () => {
  return request({
    url: "/admin_web/order",
    method: "get",
  });
};

/**
 * 订单结算
 */
export const orderSettlementService = (orderId) => {
  return request({
    url: "/admin_web/order/settle",
    method: "post",
    params: { orderId },
  });
};