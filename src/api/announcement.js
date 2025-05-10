import request from "../utils/request.js";

/**
 * 发布公告
 * @param {string} content - 公告内容
 * @returns {Promise<Object>} 返回API响应对象
 */
export const publishAnnouncement = (content) => {
  return request({
    url: "/announcement/publish",
    method: "post",
    data: { content },
  });
};