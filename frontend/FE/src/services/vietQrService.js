import axios from 'axios';
import { BANK_INFO } from '../constants/bankInfo';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

// Helper function to get auth headers with better error handling
const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  } catch (error) {
   
    return { 'Content-Type': 'application/json' };
  }
};

// Add axios request interceptor for logging
axios.interceptors.request.use(config => {

  return config;
}, error => {

  return Promise.reject(error);
});

const vietQrService = {
  /**
   * Tạo mã QR thanh toán với xử lý lỗi tốt hơn
   */
  createQrCode: async ({ orderId, amount, description }) => {
    try {
      if (!orderId || !amount || !description) {
        throw new Error('Missing required parameters');
      }

      const res = await axios.post(
        `${API_BASE_URL}/payment/create-vietqr-url`,
        { orderId, amount, description },
        { 
          headers: getAuthHeaders(),
          timeout: 10000 
        }
      );

      // Validate response data
      if (!res.data || typeof res.data !== 'string') {
        throw new Error('Invalid QR code data format');
      }

      // Format QR code URL (supports base64, data:image, and http/https URLs)
      let qrCodeUrl = res.data;
      if (!qrCodeUrl.startsWith('data:image') && !qrCodeUrl.startsWith('http')) {
        qrCodeUrl = `data:image/png;base64,${res.data}`;
      }

      return { 
        success: true, 
        data: { 
          qrCodeUrl, 
          orderId, 
          amount, 
          description,
          createdAt: new Date().toISOString() 
        }
      };
    } catch (err) {

      return { 
        success: false, 
        message: err.response?.data?.message || 
                err.message || 
                'Không thể tạo mã QR. Vui lòng thử lại sau.',
        errorCode: err.response?.status || 500
      };
    }
  },

  /**
   * Tạo URL QR public với validation tốt hơn
   */
  generatePublicQrUrl: (bankCode, accountNumber, amount, description, accountName) => {
    try {
      if (!bankCode || !accountNumber) {
        throw new Error('Missing bank information');
      }

      const cleanAmount = Math.round(Number(amount) || 0);
      const cleanAccountName = (accountName || BANK_INFO.PRIMARY_BANK.accountName || '').replace(/"/g, '').trim();
      const cleanDescription = (description || 'THANHTOAN').trim();

      const params = new URLSearchParams({
        amount: cleanAmount,
        addInfo: cleanDescription,
        accountName: cleanAccountName
      });

      const formattedBankCode = BANK_INFO.getVietQrBankCode(bankCode) || bankCode;
      return `https://img.vietqr.io/image/${formattedBankCode}-${accountNumber}-compact2.png?${params.toString()}`;
    } catch (error) {
    
      return null;
    }
  },



  /**
   * Kiểm tra trạng thái thanh toán với retry logic
   */
  checkPayment: async (description, retries = 3) => {
    if (!description?.trim()) {

      return false;
    }

    let attempt = 0;
    while (attempt < retries) {
      try {
        
        
        const { data } = await axios.get(
          `${API_BASE_URL}/payment/confirm`,
          {
            params: { 
              description: description.trim()
            },
            headers: getAuthHeaders(),
            timeout: 15000 // Tăng từ 5000ms lên 15000ms (15 giây)
          }
        );
        
        
        
        // Handle both boolean and string responses
        const isPaid = data === true || data === 'true' || String(data).toLowerCase() === 'true';
        return isPaid;
      } catch (err) {
        attempt++;
     
        // Nếu là lỗi timeout hoặc network, retry với delay lớn hơn
        if (err.code === 'ECONNABORTED' || err.code === 'NETWORK_ERROR' || !err.response) {
          if (attempt < retries) {
            const delay = 3000 * attempt; // Delay lâu hơn cho timeout
           
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // Nếu là lỗi 4xx, không retry
        if (err.response?.status >= 400 && err.response?.status < 500) {
         
          return false;
        }
        
        if (attempt >= retries) {
          
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Tăng delay từ 1000ms
      }
    }
    return false;
  },

  /**
   * Polling kiểm tra thanh toán với cải tiến
   */
  startPolling: (description, callback, options = {}) => {
    const {
      interval = 15000, // Tăng từ 5000ms lên 15000ms (15 giây) theo yêu cầu
      maxAttempts = 15, // Giảm từ 20 xuống 15 để tránh polling quá lâu
      initialDelay = 1000 // Thêm delay đầu tiên
    } = options;

    let attempts = 0;
    let isActive = true;
    let timeoutId = null;

    const cleanup = () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };

    const performCheck = async () => {
      // Kiểm tra lại isActive trước khi bắt đầu
      if (!isActive || attempts >= maxAttempts) {
       
        cleanup();
        return;
      }

      attempts++;
      
      try {
        const isPaid = await vietQrService.checkPayment(description);
        
        // Kiểm tra lại isActive sau khi API call xong (tránh race condition)
        if (!isActive) {
          return;
        }
        
        if (isPaid) {
          cleanup();
          callback({ 
            status: 'success', 
            paid: true, 
            attempts,
            message: 'Thanh toán thành công' 
          });
          return;
        }

        if (attempts >= maxAttempts) {
          cleanup();
          callback({ 
            status: 'timeout', 
            paid: false, 
            attempts,
            message: 'Hết thời gian chờ thanh toán' 
          });
          return;
        }

        // Chỉ callback và schedule tiếp nếu vẫn active
        if (isActive) {
          callback({ 
            status: 'checking', 
            attempts, 
            maxAttempts,
            nextCheckIn: interval 
          });

          timeoutId = setTimeout(performCheck, interval);
        }
      } catch (error) {
       
        // Kiểm tra lại isActive sau khi error
        if (!isActive) {
        
          return;
        }
        
        if (attempts >= maxAttempts) {
         
          cleanup();
          callback({ 
            status: 'error', 
            paid: false, 
            attempts,
            message: 'Lỗi kiểm tra thanh toán' 
          });
        } else if (isActive) {
        
          timeoutId = setTimeout(performCheck, interval);
        }
      }
    };

    // Initial delay before starting
    timeoutId = setTimeout(performCheck, initialDelay);

    return cleanup;
  },

  /**
   * Xác nhận thanh toán (wrapper for checkPayment to match PaymentResult.jsx interface)
   */
  confirmPayment: async (description) => {
    if (!description?.trim()) {
     
      return false;
    }

    try {
     
      const isPaid = await vietQrService.checkPayment(description);
      
      
     
      return isPaid;
    } catch (err) {
      
      return false;
    }
  },

  /**
   * Test method để kiểm tra backend manually
   */
  testBackendResponse: async (description) => {

    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payment/confirm`,
        {
          params: { description: description.trim() },
          headers: getAuthHeaders(),
          timeout: 10000
        }
      );
      
     
      
      return response.data;
    } catch (error) {
     
      throw error;
    }
  }
};

export default vietQrService;