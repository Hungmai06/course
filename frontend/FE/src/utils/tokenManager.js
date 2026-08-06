// tokenManager.js
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

let refreshTimeoutId = null;

const scheduleRefresh = (accessToken) => {
  try {
    const decoded = jwtDecode(accessToken);
    const exp = decoded.exp * 1000;
    const now = Date.now();
    const refreshTime = exp - now - 30 * 1000;

    if (refreshTime <= 0) {
      return refreshNow();
    }

    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }

    refreshTimeoutId = setTimeout(() => {
      refreshNow();
    }, refreshTime);
  } catch (err) {
  }
};

const refreshNow = async () => {
  let refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
  //
    window.location.href = '/login';
    return;
  }

  try {
    refreshToken = refreshToken.replace(/^"|"$/g, '');

    const res = await authService.refreshToken(refreshToken);

    const newAccessToken = res.data.accessToken;
    const newRefreshToken = res.data.refreshToken;

    if (!newAccessToken || newAccessToken.trim() === '') {
      throw new Error('AccessToken mới không hợp lệ');
    }

    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }

    scheduleRefresh(newAccessToken);
    window.dispatchEvent(new Event('tokenRefreshed'));

    
  } catch (error) {
    localStorage.clear();
    window.location.href = '/login';
  }
};

const initTokenTimer = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    scheduleRefresh(accessToken);
  }
};

const clearTokenTimer = () => {
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
};

const tokenManager = {
  initTokenTimer,
  scheduleRefresh,
  refreshNow,
  clearTokenTimer,
};

export default tokenManager;
