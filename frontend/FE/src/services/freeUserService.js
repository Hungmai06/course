import axios from "./axiosInstance";

export const freeUserService = {
  // Lấy thông tin điểm & gamification profile của user từ Backend API
  getProfile: () => {
    return axios.get("/free-user/profile");
  },

  // Điểm danh hàng ngày qua Shopee
  performCheckin: () => {
    return axios.post("/free-user/checkin");
  },

  // Học 1 bài học (+1 điểm thưởng)
  completeLesson: (courseId, courseTitle, lessonTitle) => {
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);
    if (courseTitle) params.append("courseTitle", courseTitle);
    if (lessonTitle) params.append("lessonTitle", lessonTitle);
    return axios.post(`/free-user/complete-lesson?${params.toString()}`);
  },

  // Mở trọn bộ khóa học (Trừ 30 điểm)
  unlockCourse: (courseId, courseTitle) => {
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);
    if (courseTitle) params.append("courseTitle", courseTitle);
    return axios.post(`/free-user/unlock-course?${params.toString()}`);
  },

  // Backward compatibility alias
  deductPoint: (courseId, courseTitle, lessonTitle) => {
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);
    if (courseTitle) params.append("courseTitle", courseTitle);
    if (lessonTitle) params.append("lessonTitle", lessonTitle);
    return axios.post(`/free-user/complete-lesson?${params.toString()}`);
  },

  // Lấy lịch sử biến động điểm
  getPointHistory: () => {
    return axios.get("/free-user/point-history");
  },

  // Lấy danh sách bài học/khóa học đã xem
  getLearnedHistory: () => {
    return axios.get("/free-user/learned-history");
  },

  // Áp dụng mã giới thiệu
  applyReferral: (code) => {
    return axios.post(`/free-user/referral?code=${encodeURIComponent(code)}`);
  },

  // Admin: Lấy danh sách người dùng & điểm thưởng
  getAdminUsers: () => {
    return axios.get("/free-user/admin/users");
  },

  // Admin: Lấy lịch sử biến động điểm toàn hệ thống
  getAdminPointHistory: () => {
    return axios.get("/free-user/admin/point-history");
  },

  // Admin: Lấy lịch sử học bài toàn hệ thống
  getAdminLearnedHistory: () => {
    return axios.get("/free-user/admin/learned-history");
  },

  // Admin: Cộng/trừ/cập nhật điểm người dùng
  updateUserPoints: (userId, newPoints, reason) => {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("newPoints", newPoints);
    if (reason) params.append("reason", reason);
    return axios.post(`/free-user/admin/update-points?${params.toString()}`);
  }
};

export default freeUserService;
