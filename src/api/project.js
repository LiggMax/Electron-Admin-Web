import request from "../utils/request.js";

/**
 * 获取项目列表
 */
export const getProjectListService = () => {
    return request({
        url: "/project",
        method: "get",
    });
};

/**
 * 添加项目
 */
export const addProjectService = (data) => {
    return request({
        url: "/project/add",
        method: "post",
        params: data
    });
};