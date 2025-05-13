import request from "../utils/request.js";

/**
 * 获取项目列表
 */
export const getProjectList = () => {
    return request({
        url: "/project",
        method: "get",
    });
};