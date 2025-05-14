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

/**
 * 修改资料
 */
export const updateUserInfo = (data) => {
  return request({
    url: "/adminUserWeb/edit",
    method: "post",
    data
  });
};