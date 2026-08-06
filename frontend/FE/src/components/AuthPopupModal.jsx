import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus, FaGift } from 'react-icons/fa';
import authService from '../services/authService';
import userService from '../services/userService';
import freeUserService from '../services/freeUserService';
import tokenManager from '../utils/tokenManager';
import { showToast } from '../utils/toast';
import './AuthPopupModal.css';

export default function AuthPopupModal({ isOpen, onClose, onSuccessLogin, initialMode = 'login', defaultReferralCode = '' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Sync mode if initialMode prop changes
  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Login Form State
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State (including optional referralCode)
  const [registerData, setRegisterData] = useState({ email: '', username: '', password: '', referralCode: '' });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-detect URL ?ref= param or defaultReferralCode prop
  useEffect(() => {
    if (isOpen) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlRef = searchParams.get('ref');
      const refCode = defaultReferralCode || urlRef || '';
      if (refCode) {
        setRegisterData((prev) => ({ ...prev, referralCode: refCode }));
      }
    }
  }, [isOpen, defaultReferralCode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Username và Mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login({
        username: loginData.username,
        password: loginData.password
      });

      if (res.data.status && res.data.status !== 200) {
        let msg = res.data.message || 'Đăng nhập không thành công.';
        if (msg.toLowerCase().includes('bad credentials')) {
          msg = 'Username hoặc Mật khẩu không đúng. Vui lòng thử lại!';
        }
        setErrorMessage(msg);
        showToast(msg, 'error');
      } else {
        const { accessToken, refreshToken, userResponse, roleName } = res.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          tokenManager.scheduleRefresh(accessToken);
        }
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (userResponse) localStorage.setItem('userInfo', JSON.stringify(userResponse));
        if (roleName) localStorage.setItem('roleName', roleName);

        showToast(`🎉 Xin chào ${userResponse?.username || 'bạn'}, Đăng nhập thành công!`, 'success');
        if (onSuccessLogin) onSuccessLogin(userResponse);
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!registerData.email || !registerData.username || !registerData.password) {
      setErrorMessage('Vui lòng điền đầy đủ Email, Username và Mật khẩu.');
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }

    try {
      setIsLoading(true);
      const apiData = {
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        vip: 'ENGLISH_48_NGAY'
      };

      const res = await userService.createUser(apiData);
      if (res.data.status && res.data.status !== 200) {
        setErrorMessage(res.data.message || 'Đăng ký không thành công.');
        showToast(res.data.message || 'Đăng ký không thành công.', 'error');
      } else {
        showToast('🎉 Đăng ký thành công! Đang tự động đăng nhập...', 'success');

        // Auto login after register
        try {
          const loginRes = await authService.login({
            username: registerData.username,
            password: registerData.password
          });
          const { accessToken, refreshToken, userResponse, roleName } = loginRes.data;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            tokenManager.scheduleRefresh(accessToken);
          }
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          if (userResponse) localStorage.setItem('userInfo', JSON.stringify(userResponse));
          if (roleName) localStorage.setItem('roleName', roleName);

          // Apply Referral Code if user entered one or loaded from URL
          if (registerData.referralCode && registerData.referralCode.trim()) {
            try {
              await freeUserService.applyReferral(registerData.referralCode.trim());
              showToast('🎁 Đã áp dụng mã giới thiệu thành công (+5 điểm cho người giới thiệu)!', 'success');
            } catch (refErr) {
              console.warn('Apply referral error:', refErr);
            }
          }

          if (onSuccessLogin) onSuccessLogin(userResponse);
          onClose();
        } catch (autoLoginErr) {
          setMode('login');
          setLoginData({ username: registerData.username, password: '' });
        }
      }
    } catch (err) {
      console.error('Register error:', err);
      const msg = err?.response?.data?.message || 'Đăng ký thất bại. Email hoặc Username có thể đã tồn tại!';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-popup-overlay" onClick={onClose}>
      <div className="auth-popup-box" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Title & Close Button Bar */}
        <div className="auth-popup-header">
          <div className="auth-popup-title">
            <FaLock style={{ color: '#38bdf8' }} />
            <span>{mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}</span>
          </div>
          <button className="auth-close-btn" onClick={onClose} title="Đóng" aria-label="Đóng">
            <span className="close-x-text">✕</span>
          </button>
        </div>

        {/* Tab Header Switcher */}
        <div className="auth-popup-tabs">
          <button
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setErrorMessage(''); }}
          >
            <FaSignInAlt /> Đăng Nhập
          </button>
          <button
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setErrorMessage(''); }}
          >
            <FaUserPlus /> Đăng Ký Tài Khoản
          </button>
        </div>

        {errorMessage && (
          <div className="auth-error-alert">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form className="auth-popup-form" onSubmit={handleLoginSubmit}>
            <div className="auth-form-group">
              <label className="auth-input-label">Tên đăng nhập / Username</label>
              <div className="auth-input-field">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Nhập username của bạn..."
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-input-label">Mật khẩu</label>
              <div className="auth-input-field">
                <FaLock className="input-icon" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : '⚡ Đăng Nhập Ngay'}
            </button>

            <p className="auth-switch-text">
              Chưa có tài khoản?{' '}
              <span onClick={() => { setMode('register'); setErrorMessage(''); }}>
                Đăng ký ngay (+30đ thưởng)
              </span>
            </p>
          </form>
        ) : (
          /* REGISTER FORM */
          <form className="auth-popup-form" onSubmit={handleRegisterSubmit}>
            <div className="auth-form-group">
              <label className="auth-input-label">Địa chỉ Email</label>
              <div className="auth-input-field">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-input-label">Tên đăng nhập (Username)</label>
              <div className="auth-input-field">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Chọn username..."
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-input-label">Mật khẩu</label>
              <div className="auth-input-field">
                <FaLock className="input-icon" />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự..."
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                >
                  {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* REFERRAL CODE FIELD */}
            <div className="auth-form-group">
              <label className="auth-input-label">Mã Giới Thiệu (Không bắt buộc)</label>
              <div className="auth-input-field">
                <FaGift className="input-icon" style={{ color: '#f59e0b' }} />
                <input
                  type="text"
                  placeholder="VD: FREE-W2E33 (Tự động điền nếu mở qua link)"
                  value={registerData.referralCode}
                  onChange={(e) => setRegisterData({ ...registerData, referralCode: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn register-gradient" disabled={isLoading}>
              {isLoading ? 'Đang tạo tài khoản...' : '🎁 Đăng Ký Ngay & Nhận 30đ'}
            </button>

            <p className="auth-switch-text">
              Đã có tài khoản?{' '}
              <span onClick={() => { setMode('login'); setErrorMessage(''); }}>
                Đăng nhập ngay
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
