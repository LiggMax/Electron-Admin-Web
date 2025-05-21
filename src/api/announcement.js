import request from "../utils/request.js";

/**
 * 发布公告
 */
export const publishAnnouncement = (content) => {
  return request({
    url: "/announcement/publish",
    method: "post",
    data: { content },
  });
};

/**
 * 获取公告列表
 */
export const getAnnouncementList = () => {
  return request({
    url: "/announcement",
    method: "get",
  });
};

/**
 * 删除公告
 */
export const deleteAnnouncementService = (id) => {
  return request({
    url: `/announcement`,
    method: "delete",
    params: { id },
  });
};