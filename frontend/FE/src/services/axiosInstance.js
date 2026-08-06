import axios from 'axios';
import authService from './authService';

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
});

let isRefreshing = false;
let refreshSubscribers = [];

// Gọi các request đang chờ sau khi refresh thành công
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Thêm request bị chặn vào hàng đợi
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Gắn accessToken vào mỗi request
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý token hết hạn
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu là lỗi 401 và chưa retry
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Không có refreshToken thì logout luôn
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Nếu đang trong quá trình refresh thì chờ
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await authService.refreshToken(refreshToken);
        const newAccessToken = response.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        window.dispatchEvent(new Event('tokenRefreshed'));

        onTokenRefreshed(newAccessToken);

        // Gắn token mới và gửi lại request cũ
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
