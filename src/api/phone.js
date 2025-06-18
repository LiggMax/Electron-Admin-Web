import request from "../utils/request.js";

/**
 * 获取号码列表
 */
export const getPhoneList = (data) => {
  return request({
    url: "/phone",
    method: "get",
    params: data
  });
};

/**
 * 添加号码
 * @param {Object} data 号码信息
 */
export const addPhone = (data) => {
  return request({
    url: "/phone",
    method: "post",
    data
  });
};

/**
 * 更新号码信息
 * @param {Object} data 号码信息
 */
export const updatePhone = (data) => {
  return request({
    url: `/phone/${data.phoneId}`,
    method: "put",
    data
  });
};

/**
 * 删除号码
 * @param {Number} phoneId 号码ID
 */
export const deletePhone = (phoneId) => {
  return request({
    url: `/phone`,
    method: "delete",
    params: { phoneId }
  });
};

/**
 * 批量操作号码
 * @param {Object} data 批量操作参数
 */
export const batchOperatePhone = (data) => {
  return request({
    url: "/phone/batch",
    method: "post",
    data
  });
};