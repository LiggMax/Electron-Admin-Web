import request from "../utils/request.js";

/**
 * 获取地区列表
 */
export const getRegionListService = () => {
    return request({
        url: "/admin_web/region",
        method: "get",
    });
};

/**
 * 删除地区
 * @param {number|string} regionId - 地区ID
 */
export const deleteRegionService = (regionId) => {
    return request({
        url: "/admin_web/region",
        method: "delete",
        params: {regionId}
    });
};


/**
 * 添加或修改区域
 */
export function saveOrUpdateRegion(data) {
    return request({
        url: "/admin_web/region/save_or_update_region",
        method: "post",
        data
    });
}

/**
 * 更新地区图标
 */
export function updateRegionIcon(data) {
    return request({
        url: "/admin_web/region/upload_region_icon",
        method: "post",
        data,
    });
}