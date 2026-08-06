// services/orderService.js
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const orderService = {
  // Kiểm tra voucher hợp lệ
  validateVoucher: (couponCode, vouchers, cartTotal) => {
    if (!couponCode) return { valid: true };
    const voucher = vouchers.find(v => v.code === couponCode);
    if (!voucher) return { valid: false, message: 'Mã giảm giá không tồn tại.' };
    // So sánh ngày theo UTC, chỉ lấy năm-tháng-ngày
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = voucher.startDate ? new Date(voucher.startDate) : null;
    let expiredDate = voucher.expiredDate ? new Date(voucher.expiredDate) : null;
    if (startDate) {
      const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      if (startUTC > todayUTC) {
        return { valid: false, message: 'Mã giảm giá chưa đến ngày bắt đầu sử dụng.' };
      }
    }
    if (expiredDate) {
      const expiredUTC = Date.UTC(expiredDate.getFullYear(), expiredDate.getMonth(), expiredDate.getDate());
      if (expiredUTC < todayUTC) {
        return { valid: false, message: 'Mã giảm giá đã hết hạn.' };
      }
    }
    if (voucher.usageCount !== undefined && voucher.usageCount <= 0) {
      return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng.' };
    }
    if (voucher.minimumOrder && cartTotal < voucher.minimumOrder) {
      return { valid: false, message: `Đơn hàng phải từ ${voucher.minimumOrder}đ mới dùng được mã này.` };
    }
    if (voucher.discountPercent && Number(voucher.discountPercent) <= 0) {
      return { valid: false, message: 'Mã giảm giá không có giá trị giảm.' };
    }
    return { valid: true };
  },
  // Tạo đơn hàng mới, kiểm tra voucher trước khi gửi lên backend
  createOrder: async (orderData, vouchers = [], cartTotal = 0) => {
    // Luôn gửi đơn hàng lên backend, không kiểm tra voucher ở FE
    try {
      const token = localStorage.getItem('accessToken');
      // Chỉ gửi đúng dữ liệu OrderRequest lên backend
      let userId = '';
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          if (user && user.id) userId = user.id;
        }
      } catch {}
      const payload = {
        courseIds: orderData.courseIds,
        couponCode: typeof orderData.couponCode === 'string' ? orderData.couponCode : (orderData.couponCode ? String(orderData.couponCode) : ''),
        fullName: orderData.fullName,
        email: orderData.email,
        phone: orderData.phone,
        description: orderData.description || ''
      };
      if (userId) payload.userId = userId;
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.post(`${API_BASE_URL}/order/`, payload, { headers });
      // Clear cart sau khi tạo đơn hàng thành công
      import('../utils/cartLocalStorage').then(mod => {
        if (mod && typeof mod.clearCart === 'function') {
          mod.clearCart();
        }
      });
      import('../utils/syncCart').then(mod => {
        if (mod && typeof mod.syncCart === 'function') {
          mod.syncCart([]);
        }
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
     
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo đơn hàng'
      };
    }
  },

  // Lấy danh sách đơn hàng của user
  getOrders: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/order/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {

      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải danh sách đơn hàng'
      };
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (orderId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
     
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tải chi tiết đơn hàng'
      };
    }
  },
  getAll: (page, size, sortBy = 'id', sortDir = 'desc') => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${API_BASE_URL}/order/g?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  search: (page, size, keyword, sortBy = 'id', sortDir = 'desc') => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${API_BASE_URL}/order/s?page=${page}&size=${size}&keyword=${encodeURIComponent(keyword || '')}&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  ,
  update: (orderId, status) => {
    const token = localStorage.getItem('accessToken');
    return axios.put(`${API_BASE_URL}/order/${orderId}?status=${encodeURIComponent(status)}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updateEmail: (orderId, email) => {
    const token = localStorage.getItem('accessToken');
    return axios.put(`${API_BASE_URL}/order/email/${orderId}`, { email }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
};

export default orderService;
