import request from "../utils/request.js";

/**
 * 获取账单数据
 */
export const getBillList = () => {
    return request.get("/bill/customerBill")
}