import request from "../utils/request.js";

/**
 * 发布、编辑公告
 */
export const Announcement = (data) => {
  return request({
    url: "/announcement/publishOrUpdate",
    method: "post",
    data
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