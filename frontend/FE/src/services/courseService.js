import axios from "./axiosInstance";
import GetMyCourse from "../pages/GetMyCourse";
import { cacheService } from "./cacheService";

export const courseService = {
  // Lấy tất cả khóa học (có cache + stale-while-revalidate)
  getAll: (page = 0, size = 8) => {
    const cacheKey = `page_${page}_size_${size}`;
    
    // 1️⃣ Lấy cached data (ngay lập tức) - không đợi
    const cachedData = cacheService.getStale('courses_all', cacheKey);
    const isExpired = cacheService.isExpired('courses_all', cacheKey);
    
    // 2️⃣ Nếu cache hết hạn, fetch nền (background)
    if (isExpired) {
      axios.get(`/course/?page=${page}&size=${size}`).then(response => {
        // Lưu data mới vào cache
        cacheService.set('courses_all', response.data, cacheKey, 'courses');
      }).catch(err => {});
    }

    // 3️⃣ Return cached data ngay (nếu có) hoặc fetch
    if (cachedData) {
      return Promise.resolve({ data: cachedData });
    }

    // Nếu không có cache, fetch (blocking)
    return axios.get(`/course/?page=${page}&size=${size}`).then(response => {
      cacheService.set('courses_all', response.data, cacheKey, 'courses');
      return response;
    });
  },

  // Lấy theo tên danh mục (có cache + stale-while-revalidate)
  getByCategory: (categoryName) => {
    const cacheKey = `category_${categoryName}`;
    
    // 1️⃣ Lấy cached data ngay
    const cachedData = cacheService.getStale('courses_category', cacheKey);
    const isExpired = cacheService.isExpired('courses_category', cacheKey);
    
    // 2️⃣ Fetch mới nền nếu hết hạn
    if (isExpired) {
      axios.get(`/course/category`, {
        params: { name: categoryName }
      }).then(response => {
        cacheService.set('courses_category', response.data, cacheKey, 'categories');
      }).catch(err => {});
    }

    // 3️⃣ Return cached data ngay
    if (cachedData) {
      return Promise.resolve({ data: cachedData });
    }

    // Nếu không có cache, fetch
    return axios.get(`/course/category`, {
      params: { name: categoryName }
    }).then(response => {
      cacheService.set('courses_category', response.data, cacheKey, 'categories');
      return response;
    });
  },

  // Tạo mới
  create: (data) => {
    return axios.post(`/course/`, data);
  },

  // Cập nhật
  update: (id, data) => {
    return axios.put(`/course/${id}`, data);
  },

  // Xoá
  remove: (id) => {
    return axios.delete(`/course/${id}`);
  },

  async getCoursesByUserId(userId) {
    const cacheKey = `user_${userId}`;
    
    // Kiểm tra cache trước
    const cachedData = cacheService.get('courses_user', cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(`/course/${userId}`);
      
      // Lưu vào cache
      cacheService.set('courses_user', response.data, cacheKey, 'user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  searchCourse: ({ keyword, page = 0, size = 12 }) => {
    const cacheKey = `search_${keyword}_page_${page}_size_${size}`;
    
    // 1️⃣ Lấy cached data ngay
    const cachedData = cacheService.getStale('courses_search', cacheKey);
    const isExpired = cacheService.isExpired('courses_search', cacheKey);
    
    // 2️⃣ Fetch mới nền nếu hết hạn
    if (isExpired) {
      axios.get(`/course/search`, {
        params: { keyword, page, size }
      }).then(response => {
        cacheService.set('courses_search', response.data, cacheKey, 'courses');
      }).catch(err => {});
    }

    // 3️⃣ Return cached data ngay
    if (cachedData) {
      return Promise.resolve({ data: cachedData });
    }

    // Nếu không có cache, fetch
    return axios.get(`/course/search`, {
      params: { keyword, page, size }
    }).then(response => {
      cacheService.set('courses_search', response.data, cacheKey, 'courses');
      return response;
    });
  },

  // Lấy 20 khóa học ngẫu nhiên bằng Fisher-Yates shuffle algorithm (có cache + stale-while-revalidate)
  getRandomCourses: async (excludeCourseId = null) => {
    const cacheKey = `random_${excludeCourseId || 'none'}`;
    
    // 1️⃣ Lấy data cũ ngay (stale cache)
    const cachedData = cacheService.getStale('random_courses', cacheKey);
    const isExpired = cacheService.isExpired('random_courses', cacheKey);

    // 2️⃣ Nếu cache hết hạn, fetch mới nền
    if (isExpired) {
      axios.get(`/course/?page=0&size=1000`).then(response => {
        let allCourses = response?.data?.data?.content || response?.data?.content || [];
        if (excludeCourseId) {
          allCourses = allCourses.filter(c => c.id !== excludeCourseId);
        }
        for (let i = allCourses.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allCourses[i], allCourses[j]] = [allCourses[j], allCourses[i]];
        }
        const random20 = allCourses.slice(0, 20);
        cacheService.set('random_courses', random20, cacheKey, 'random');
      }).catch(err => {});
    }

    // 3️⃣ Return cached data ngay (nếu có)
    if (cachedData) {
      return cachedData;
    }

    // Nếu không có cache, fetch (blocking)
    try {
      const response = await axios.get(`/course/?page=0&size=1000`);

      let allCourses = response?.data?.data?.content || response?.data?.content || [];
      if (excludeCourseId) {
        allCourses = allCourses.filter(c => c.id !== excludeCourseId);
      }

      for (let i = allCourses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCourses[i], allCourses[j]] = [allCourses[j], allCourses[i]];
      }

      const random20 = allCourses.slice(0, 20);
      cacheService.set('random_courses', random20, cacheKey, 'random');
      return random20;
    } catch (error) {
      throw error;
    }
  },

  // Đồng bộ slug
  syncSlugs: () => {
    return axios.post(`/course/sync-slugs`);
  },

  // Xóa tất cả course cache
  clearCache: () => {
    cacheService.removeNamespace('courses_all');
    cacheService.removeNamespace('courses_category');
    cacheService.removeNamespace('courses_search');
    cacheService.removeNamespace('courses_user');
    cacheService.removeNamespace('random_courses');
  }
};
export default courseService;