import request from "../utils/request.js";

/**
 * 获取软件更新列表
 */
export const getUpdateAPPList = () => {
    return request.get("/version/list")
}