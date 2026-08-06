import React, { useState } from 'react';
import { syncLocalCartToDB } from '../utils/syncCart';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';
import authService from '../services/authService';
import Navbar from '../components/Navbar';
import tokenManager from '../utils/tokenManager';
import { showToast } from '../utils/toast';
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Tên đăng nhập không được để trống';
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      try {
        // Gọi API đăng nhập
        const response = await authService.login({
          username: formData.username,
          password: formData.password
        });
        
        // Kiểm tra response có lỗi không
        if (response.data.status && response.data.status !== 200) {
          let errorMessage = response.data.message || 'Có lỗi xảy ra khi đăng nhập.';
          
          // Kiểm tra nếu backend trả về "Bad credentials" thì thay đổi thông báo
          if (errorMessage.toLowerCase().includes('bad credentials') || 
              errorMessage.toLowerCase().includes('bad request')) {
            errorMessage = 'Username/Password không đúng. Vui lòng kiểm tra lại.';
          }
          
          showToast(errorMessage, 'error');
          setErrors({ general: errorMessage });
        } else if (response.data.error) {
          let errorMessage = response.data.message || 'Có lỗi xảy ra khi đăng nhập.';
          
          // Kiểm tra nếu backend trả về "Bad credentials" thì thay đổi thông báo
          if (errorMessage.toLowerCase().includes('bad credentials') || 
              errorMessage.toLowerCase().includes('bad request')) {
            errorMessage = 'Username/Password không đúng. Vui lòng kiểm tra lại.';
          }
          
          showToast(errorMessage, 'error');
          setErrors({ general: errorMessage });
        } else {
          
          const { accessToken, refreshToken, userResponse, roleName } = response.data;
        
          // Lưu tokens và thông tin user vào localStorage
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            tokenManager.scheduleRefresh(accessToken); //
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          if (userResponse) {
            localStorage.setItem('userInfo', JSON.stringify(userResponse));
          }
          if (roleName) {
            localStorage.setItem('roleName', roleName);
          }

          if (userResponse?.id) {
            await syncLocalCartToDB(userResponse.id);
          }

          const loginEvent = new CustomEvent('userLoggedIn');
          window.dispatchEvent(loginEvent);
          
          showToast('Đăng nhập thành công!', 'success');
          

          if (roleName === 'ADMIN') {
         
            navigate('/admin');
          } else {
         
            navigate('/');
          }
        }
        
      } catch (error) {
        if (error.response) {
          const { data, status } = error.response;
          
          let errorMessage = '';
          
          // Kiểm tra nhiều trường hợp khác nhau của response structure
          if (data && typeof data === 'string') {
            errorMessage = data;
          } else if (data && data.message) {
            errorMessage = data.message;
          } else if (data && data.error) {
            errorMessage = data.error;
          } else if (status === 401 || status === 403) {
            errorMessage = 'Bad credentials';
          } else {
            errorMessage = 'Có lỗi xảy ra khi đăng nhập.';
          }
          
         

          // Kiểm tra và chuyển đổi thông báo lỗi
          if (errorMessage.toLowerCase().includes('bad credentials') || 
              errorMessage.toLowerCase().includes('bad request') ||
              errorMessage.toLowerCase().includes('unauthorized') ||
              status === 401) {
            errorMessage = 'Username/Password không đúng. Vui lòng kiểm tra lại.';
          }
          
          // Debug log
          
          showToast(errorMessage, 'error');
          setErrors({ general: errorMessage });
        } else if (error.request) {
          showToast('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', 'error');
          setErrors({ general: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' });
        } else {
          showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
          setErrors({ general: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <Navbar />
  
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Image */}
        <div className="auth-image-section">
          <div className="auth-image">
            <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Students learning" 
            />
            <div className="image-overlay">
              <h2>Khám phá thế giới học tập</h2>
              <p>Nâng cao kỹ năng với các khóa học chất lượng cao</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Chào mừng trở lại!</h2>
              <div className="auth-tabs">
                <Link to="/login" className="auth-tab active">
                  Đăng nhập
                </Link>
                <Link to="/register" className="auth-tab">
                  Đăng ký
                </Link>
              </div>
            </div>

            <p className="auth-subtitle">
              Đăng nhập để tiếp tục hành trình học tập của bạn
            </p>

            <form onSubmit={handleSubmit} >
              {/* General Error Message */}
              {errors.general && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ color: '#ef4444', fontWeight: 500 }}>{errors.general}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập của bạn"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  required
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu của bạn"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Ghi nhớ đăng nhập
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Chưa có tài khoản?{' '}
                <Link to="/register" className="auth-link">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
  );
};

export default Login;