import request from "../utils/request.js";

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request({
    url: "/adminUserWeb/info",
    method: "get",
  });
};