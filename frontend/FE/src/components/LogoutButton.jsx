import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { appCacheManager } from '../utils/appCacheManager';

const LogoutButton = ({ className = "logout-button", onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    
    const keysToRemove = [
      'accessToken',
      'refreshToken', 
      'userInfo',
      'roleName',
      'user',
      'token',
      'authToken',
      'loginData'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    
    sessionStorage.clear();
    
    // 🗑️ Xóa toàn bộ app cache
    appCacheManager.clearAllCache();
   
    const logoutEvent = new CustomEvent('userLoggedOut');
    window.dispatchEvent(logoutEvent);
    
   
    window.dispatchEvent(new Event('storage'));
    
  
    if (onLogout) {
      onLogout();
    }
    
    setTimeout(() => {
      navigate('/login');
      showToast('Đã đăng xuất thành công!', 'success');
    }, 100);
  };
  
  return (
    <button onClick={handleLogout} className={className}>
      Đăng xuất
    </button>
  );
};

export default LogoutButton;
