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
