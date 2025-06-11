import request from "../utils/request.js";

/**
 * 获取地区列表
 */
export const getRegionListService = () => {
    return request({
        url: "/adminWeb/region",
        method: "get",
    });
};

/**
 * 删除地区
 * @param {number|string} regionId - 地区ID
 */
export const deleteRegionService = (regionId) => {
    return request({
        url: "/adminWeb/region",
        method: "delete",
        params: {regionId}
    });
};


/**
 * 添加或修改区域
 */
export function saveOrUpdateRegion(data) {
    return request({
        url: "/adminWeb/region/saveOrUpdateRegion",
        method: "post",
        data
    });
}

/**
 * 更新地区图标
 */
export function updateRegionIcon(data) {
    return request({
        url: "/adminWeb/region/upload_region_icon",
        method: "post",
        data,
    });
}