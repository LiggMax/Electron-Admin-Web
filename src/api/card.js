import request from "../utils/request.js";

/**
 * 获取卡商列表
 */
export const getCardList = () => {
    return request({
        url: "/card",
        method: "get",
    });
};

/**
 * 编辑卡商数据
 */
export const editCard = (data) => {
    return request({
        url: "/card/edit",
        method: "put",
        data
    });
};

/**
 *重置卡商密码
 */
export const resetPassword = (data) => {
    return request({
        url: "/card/reset",
        method: "put",
        params: data
    });
};

/**
 * 添加卡商
 */
export const addCard = (data) => {
    return request({
        url: "/card/add",
        method: "post",
        data
    });
};