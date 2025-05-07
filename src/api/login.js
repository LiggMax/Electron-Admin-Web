import request from "../utils/request.js";

/**
 * 登录
 * @param {Object} data - 登录参数
 * @param {string} data.account - 用户账号
 * @param {string} data.password - 用户密码
 * @returns {Promise<Object>} 返回包含token的响应对象
 */
export const loginService = (data) => {
  return request({
    url: "/adminWeb/account/login",
    method: "post",
    data,
  });
};