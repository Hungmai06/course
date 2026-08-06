import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/user`;

const sanitizeUserPayload = (userData) => {
  if (!userData || typeof userData !== 'object') return userData;
  const { phone, avatar, confirmPassword, ...rest } = userData;
  return rest;
};

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return user;
  const { phone, avatar, ...rest } = user;
  return rest;
};

const normalizeUserResponse = (response) => {
  const data = response?.data?.data;
  if (!data) return response;

  if (Array.isArray(data.content)) {
    response.data.data.content = data.content.map(normalizeUser);
    return response;
  }

  response.data.data = normalizeUser(data);
  return response;
};

const userService = {
  //  Lấy tất cả user (gửi accessToken để xác thực quyền)
  getAllUsers: (page , size ) => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/?page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(normalizeUserResponse);
  },

  //  Tạo user mới (hỗ trợ FormData cho file upload)
  createUser: (userData) => {
    const payload = userData instanceof FormData ? userData : sanitizeUserPayload(userData);
    return axios.post(`${BASE_URL}/`, payload).then(normalizeUserResponse);
  },

  //  Tìm user theo ID
  getUserById: (id) => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(normalizeUserResponse);
  },

  //  Cập nhật user
  updateUser: (id, userData) => {
    const token = localStorage.getItem('accessToken');
    if (userData instanceof FormData) {
      return axios.put(`${BASE_URL}/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(normalizeUserResponse);
    }
    const payload = sanitizeUserPayload(userData);
    return axios.put(`${BASE_URL}/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(normalizeUserResponse);
  },

  //  Xóa user theo ID
  deleteUser: (id) => {
    const token = localStorage.getItem('accessToken');
    return axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  //  Tìm kiếm user (hỗ trợ phân trang, truyền credential)
  searchUser: ({ credential, page = 0, size = 8 }) => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/s`, {
      params: { credential, page, size },
      headers: { Authorization: `Bearer ${token}` }
    }).then(normalizeUserResponse);
  },
};

export default userService;
