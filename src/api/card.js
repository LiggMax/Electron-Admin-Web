import request from "../utils/request.js";

/**
 * 获取卡商列表
 */
export const getCardList = () => {
    return request({
        url: "/admin_web/card",
        method: "get",
    });
};

/**
 * 编辑卡商数据
 */
export const editCard = (data) => {
    return request({
        url: "/admin_web/card/edit",
        method: "put",
        data
    });
};

/**
 *重置卡商密码
 */
export const resetPassword = (data) => {
    return request({
        url: "/admin_web/card/reset",
        method: "put",
        params: data
    });
};

/**
 * 添加卡商
 */
export const addCard = (data) => {
    return request({
        url: "/admin_web/card/add",
        method: "post",
        params: data
    });
};

/**
 * 删除卡商
 */
export const deleteCardService = (userId) => {
    return request({
        url: `/admin_web/card/deleteCard`,
        method: "delete",
        params: {userId}
    });
};

/**
 * 更新卡商余额
 */
export const updateCardBalance = (data) => {
    return request({
        url: "/admin_web/card/payouts",
        method: "put",
        params: data
    })
}