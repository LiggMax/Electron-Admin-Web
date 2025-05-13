import request from "../utils/request.js";

/**
 * 获取卡商列表
 */
export const getCardList = () => {
    return request({
        url: "/Card",
        method: "get",
    });
};
