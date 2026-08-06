import axios from "./axiosInstance";

export const freeCourse = {
  // Lấy tất cả dưới dạng danh sách
  getAll: () => {
    return axios.get("/course-free/all");
  },

  // Lấy theo phân trang & tìm kiếm
  getByDescription: (page = 0, size = 1000, description = '') => {
    return axios.get(`/course-free/?page=${page}&size=${size}&description=${encodeURIComponent(description)}`);
  },

  // Lấy chi tiết theo ID
  getById: (id) => {
    return axios.get(`/course-free/${id}`);
  },

  // Tạo mới (axiosInstance tự động thêm Bearer token)
  create: (data) => {
    return axios.post("/course-free/", data);
  },

  // Cập nhật (axiosInstance tự động thêm Bearer token)
  update: (id, data) => {
    return axios.put(`/course-free/${id}`, data);
  },

  // Tăng lượt xem
  incrementView: (id) => {
    return axios.post(`/course-free/${id}/view`);
  },

  // Xoá (axiosInstance tự động thêm Bearer token)
  remove: (id) => {
    return axios.delete(`/course-free/${id}`);
  }
};

export default freeCourse;