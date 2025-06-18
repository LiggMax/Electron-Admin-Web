import request from "../utils/request.js";

/**
 * 用户账单数据
 */
export const getBillList = (data) => {
    return request({
        url: '/bill/user_bill',
        method: 'get',
        params: data
    })
}

/**
 * 订单账单
 */
export const getOrderBillList = (data) => {
    return request({
        url: '/bill/order_bill',
        method: 'get',
        params: data
    })
}

/**
 * 账单详情
 */
export const getBillDetail = (purchaseTime) => {
    return request({
        url: '/bill/order_detail',
        method: 'get',
        params: {
            purchaseTime: purchaseTime
        }
    })
}