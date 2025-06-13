import request from "../utils/request.js";

/**
 * 获取项目列表
 */
export const getProjectListService = () => {
    return request({
        url: "/admin_web/project",
        method: "get",
    });
};

/**
 * 添加项目
 */
export const addProjectService = (data) => {
    return request({
        url: "/admin_web/project/add",
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
        url: "/admin_web/project",
        method: "delete",
        params: {projectId}
    });
};

/**
 * 编辑项目
 */
export const editProjectService = (data) => {
    return request({
        url: "/admin_web/project/edit",
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
        url: "/admin_web/project/upload_icon",
        method: "post",
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/**
 * 添加项目关键词
 */
export const setProjectKeywordService = (data) => {
    return request({
        url: "/admin_web/project/set_keywords",
        method: "post",
        data
    });
}

/**
 * 获取项目关键词列表
 */
export const getProjectKeywordListService = (projectId) => {
    return request({
        url: "/admin_web/project/keywords",
        method: "get",
        params: {
            projectId
        }
    });
}

/**
 * 删除项目关键词
 */
export const deleteProjectKeywordService = (keywordId) => {
    return request({
        url: "/admin_web/project/delete_keyword",
        method: "delete",
        params: {
            keywordId
        }
    });
}

/**
 * 编辑项目关键词
 */
export const editProjectKeywordService = (data) => {
    return request({
        url: "/admin_web/project/edit_keyword",
        method: "put",
        data
    });
}
