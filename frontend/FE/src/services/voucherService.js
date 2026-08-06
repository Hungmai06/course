// services/voucherService.js
import axios from 'axios';
import { cacheService } from './cacheService';

export const getAllVouchers = async () => {
  // 1️⃣ Lấy data cũ ngay (stale cache)
  const cachedData = cacheService.getStale('vouchers_all');
  const isExpired = cacheService.isExpired('vouchers_all');

  // 2️⃣ Fetch mới nền nếu hết hạn
  if (isExpired) {
    console.log('🔄 Background revalidate: vouchers...');
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/discount_code/`)
      .then(response => {
        if (response.data && (response.data.code === 200 || response.data.code === 0)) {
          const vouchersData = response.data.data;
          cacheService.set('vouchers_all', vouchersData, '', 'default');
          console.log('✅ Vouchers cached updated in background');
        }
      })
      .catch(err => console.log('Background fetch error:', err));
  }

  // 3️⃣ Return cached data ngay (nếu có)
  if (cachedData) {
    console.log('🚀 Lấy vouchers từ cache (stale)!');
    return {
      success: true,
      data: cachedData,
      message: 'Từ cache'
    };
  }
 
  try {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/discount_code/`);
    if (response.data && (response.data.code === 200 || response.data.code === 0)) {
      const vouchersData = response.data.data;
      
      // Lưu vào cache (15 phút)
      cacheService.set('vouchers_all', vouchersData, '', 'default');
    
      return {
        success: true,
        data: vouchersData,
        message: response.data.message
      };
    } else {
      return {
        success: false,
        data: [],
        message: response.data?.message || 'Có lỗi xảy ra'
      };
    }
  } catch (error) {
  
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể tải danh sách voucher'
    };
  }
};
