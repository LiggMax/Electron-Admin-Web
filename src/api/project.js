import request from "../utils/request.js";

/**
 * 获取项目列表
 */
export const getProjectListService = () => {
    return request({
        url: "/adminWeb/project",
        method: "get",
    });
};

/**
 * 添加项目
 */
export const addProjectService = (data) => {
    return request({
        url: "/adminWeb/project/add",
        method: "post",
        params: data
    });
};

/**
 * 删除项目
 * @param {number|string} projectId - 项目ID
 */
export const deleteProjectService = (projectId) => {
    return request({
        url: "/adminWeb/project",
        method: "delete",
        params: { projectId }
    });
};

/**
 * 编辑项目
 */
export const editProjectService = (projectId,projectPrice,projectName) => {
    return request({
        url: "/adminWeb/project/edit",
        method: "put",
        params: {
            projectId,
            projectPrice,
            projectName
        }
    });
};