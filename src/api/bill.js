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