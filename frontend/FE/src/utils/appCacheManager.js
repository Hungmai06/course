// Global App Cache Management
// Utility để quản lý cache toàn bộ app
import { cacheService } from '../services/cacheService';
import courseService from '../services/courseService';

export const appCacheManager = {
  // Xóa tất cả cache khi user logout
  clearAllCache: () => {
    console.log('🗑️  Clearing all app cache on logout...');
    cacheService.clear();
    courseService.clearCache();
  },

  // Xóa cache cụ thể
  clearCache: (namespace, identifier = '') => {
    cacheService.remove(namespace, identifier);
  },

  // Refresh cache (xóa và fetch lại data)
  refreshCourses: async () => {
    console.log('🔄 Refreshing course cache...');
    courseService.clearCache();
    // Thêm logic để re-fetch data nếu cần
  },

  // Kiểm tra trạng thái cache
  getCacheStats: () => {
    return cacheService.getStats();
  },

  // Xóa expire cache (cache hết hạn)
  cleanExpiredCache: () => {
    const stats = cacheService.getStats();
    const expiredKeys = Object.keys(stats).filter(key => stats[key].expired);
    console.log(`🗑️  Found ${expiredKeys.length} expired cache entries`);
    return expiredKeys;
  }
};
