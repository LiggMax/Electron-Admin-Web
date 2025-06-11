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
        data
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
        params: {projectId}
    });
};

/**
 * 编辑项目
 */
export const editProjectService = (data) => {
    return request({
        url: "/adminWeb/project/edit",
        method: "put",
        data
    });
};

/**
 * 上传项目图标
 * @param {FormData} formData - 包含项目ID和图片文件的FormData
 */
export const uploadIconService = (formData) => {
    return request({
        url: "/adminWeb/project/upload_icon",
        method: "post",
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};