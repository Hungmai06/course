// Global Cache Service - Cache dữ liệu API cho toàn bộ website
class CacheService {
  constructor() {
    this.cachePrefix = 'app_cache_';
    this.cacheTTL = {
      // TTL (Time To Live) in milliseconds
      courses: 5 * 60 * 1000,           // 5 phút cho courses
      categories: 30 * 60 * 1000,       // 30 phút cho categories
      random: 10 * 60 * 1000,           // 10 phút cho random courses
      cart: 1 * 60 * 1000,              // 1 phút cho cart
      user: 60 * 60 * 1000,             // 1 giờ cho user profile
      default: 15 * 60 * 1000,          // 15 phút mặc định
    };
  }

  // Tạo key cho cache
  getKey(namespace, identifier = '') {
    return `${this.cachePrefix}${namespace}${identifier ? '_' + identifier : ''}`;
  }

  // Lưu data vào cache
  set(namespace, data, identifier = '', ttlType = 'default') {
    try {
      const key = this.getKey(namespace, identifier);
      const ttl = this.cacheTTL[ttlType] || this.cacheTTL.default;
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        ttl: ttl,
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  // Lấy data từ cache (nếu còn hiệu lực) - Blocking
  get(namespace, identifier = '') {
    try {
      const key = this.getKey(namespace, identifier);
      const cached = localStorage.getItem(key);

      if (!cached) {
        return null; // Không có cache
      }

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      const isExpired = now - cacheData.timestamp > cacheData.ttl;

      if (isExpired) {
        localStorage.removeItem(key);
        return null; // Cache hết hạn
      }
      return cacheData.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  // 🚀 Lấy data từ cache (kể cả hết hạn) - Non-blocking (Stale-While-Revalidate)
  // Trả về data cũ ngay lập tức, không chờ
  getStale(namespace, identifier = '') {
    try {
      const key = this.getKey(namespace, identifier);
      const cached = localStorage.getItem(key);

      if (!cached) {
        return null; // Không có cache
      }

      const cacheData = JSON.parse(cached);
      return cacheData.data; // Trả về dữ liệu cũ luôn, kể cả hết hạn
    } catch (error) {
      console.warn('Cache getStale error:', error);
      return null;
    }
  }

  // Kiểm tra cache đã hết hạn hay chưa
  isExpired(namespace, identifier = '') {
    try {
      const key = this.getKey(namespace, identifier);
      const cached = localStorage.getItem(key);

      if (!cached) {
        return true; // Không có cache = hết hạn
      }

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      return now - cacheData.timestamp > cacheData.ttl;
    } catch (error) {
      console.warn('Cache isExpired error:', error);
      return true;
    }
  }

  // Xóa cache cụ thể
  remove(namespace, identifier = '') {
    try {
      const key = this.getKey(namespace, identifier);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Cache remove error:', error);
    }
  }

  // Xóa toàn bộ cache theo namespace, kể cả các key có identifier
  removeNamespace(namespace) {
    try {
      const prefix = this.getKey(namespace);
      const keys = [];

      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }

      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Cache removeNamespace error:', error);
    }
  }

  // Xóa tất cả cache
  clear() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.cachePrefix)) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  // Kiểm tra cache còn lệ không
  isValid(namespace, identifier = '') {
    return this.get(namespace, identifier) !== null;
  }

  // Lấy thông tin cache (debug)
  getStats() {
    const stats = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.cachePrefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const now = Date.now();
          const isExpired = now - data.timestamp > data.ttl;
          stats[key] = {
            expired: isExpired,
            age: Math.round((now - data.timestamp) / 1000) + 's',
            ttl: Math.round(data.ttl / 1000) + 's',
          };
        } catch (e) {
          /* skip */
        }
      }
    }
    return stats;
  }
}

export const cacheService = new CacheService();
