import axios from "axios";
import { cacheService } from "./cacheService";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/category`;

export const categoryService = {
  // Stale-While-Revalidate: Show cached data immediately, fetch new in background
  getAll: async (force = false) => {
    // 1️⃣ Lấy data cũ ngay (stale cache)
    const cachedData = cacheService.getStale('categories_all');
    const isExpired = cacheService.isExpired('categories_all');

    // 2️⃣ Fetch mới nền nếu hết hạn (hoặc khi yêu cầu force)
    if (isExpired || force) {
      console.log('🔄 Background revalidate: categories...');
      axios.get(`${BASE_URL}/`).then(response => {
        cacheService.set('categories_all', response.data, '', 'categories');
        console.log('✅ Categories cached updated in background');
      }).catch(err => console.log('Background fetch error:', err));
    }

    // 3️⃣ Return cached data ngay (nếu có)
    if (cachedData && !force) {
      console.log('🚀 Lấy categories từ cache (stale)!');
      return Promise.resolve({ data: cachedData });
    }

    // Nếu không có cache, fetch toàn bộ danh mục (hỗ trợ cả API phân trang)
    const extractList = (response) => {
      const payload = response?.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.content)) return payload.content;
      if (Array.isArray(payload?.data?.content)) return payload.data.content;
      if (Array.isArray(payload?.items)) return payload.items;
      return [];
    };

    const extractTotalPages = (response) => {
      const payload = response?.data;
      return payload?.data?.totalPages ?? payload?.totalPages ?? 1;
    };

    const firstResponse = await axios.get(`${BASE_URL}/`, {
      params: { page: 0, size: 1000 }
    });

    let allCategories = extractList(firstResponse);
    const totalPages = extractTotalPages(firstResponse);

    if (totalPages > 1) {
      const pageRequests = [];
      for (let page = 1; page < totalPages; page += 1) {
        pageRequests.push(axios.get(`${BASE_URL}/`, { params: { page, size: 1000 } }));
      }

      const pageResponses = await Promise.all(pageRequests);
      pageResponses.forEach((response) => {
        allCategories = allCategories.concat(extractList(response));
      });
    }

    const normalizedResponse = {
      ...firstResponse,
      data: {
        ...(typeof firstResponse.data === 'object' && !Array.isArray(firstResponse.data) ? firstResponse.data : {}),
        data: allCategories,
      },
    };

    cacheService.set('categories_all', normalizedResponse.data, '', 'categories');
    return normalizedResponse;
  },
  getById: (id) => {
    const cacheKey = `by_id_${id}`;
    
    // Kiểm tra cache trước
    const cachedData = cacheService.get('categories_single', cacheKey);
    if (cachedData) {
      console.log('🚀 Lấy category từ cache!');
      return Promise.resolve({ data: cachedData });
    }

    const token = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      // Lưu vào cache
      cacheService.set('categories_single', response.data, cacheKey, 'categories');
      return response;
    });
  },
  create: (data) => {
    const token = localStorage.getItem('accessToken');
    return axios.post(`${BASE_URL}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  update: (id, data) => {
    const token = localStorage.getItem('accessToken');
    return axios.put(`${BASE_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  remove: (id) => {
    const token = localStorage.getItem('accessToken');
    return axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  clearCache: () => {
    cacheService.removeNamespace('categories_all');
    cacheService.removeNamespace('categories_single');
  },
};
