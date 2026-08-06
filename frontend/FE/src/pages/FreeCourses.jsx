import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import freeCourse from '../services/freeCourse';
import freeUserService from '../services/freeUserService';
import Pagination from '../components/Pagination';
import AuthPopupModal from '../components/AuthPopupModal';
import { getSlugWithId } from '../utils/slugify';
import {
  FaSearch,
  FaExternalLinkAlt,
  FaBookOpen,
  FaInfoCircle,
  FaCode,
  FaLanguage,
  FaLaptopCode,
  FaLightbulb,
  FaLayerGroup,
  FaPlayCircle,
  FaFolderOpen,
  FaFileAlt,
  FaEye,
  FaShoppingBag,
  FaUserCircle,
  FaCalendarCheck,
  FaUserPlus,
  FaHistory,
  FaGift,
  FaCheckCircle,
  FaFire,
  FaCoins,
  FaCopy,
  FaCheck,
  FaTrophy,
  FaAward,
  FaStar,
  FaChevronDown,
  FaSignOutAlt,
  FaLock,
  FaSignInAlt,
  FaUserCheck,
  FaGraduationCap
} from 'react-icons/fa';
import './FreeCourses.css';

const SHOPEE_LINK = "https://s.shopee.vn/8KmufuFQ2y";

// Helper to count lessons recursively
const countLessonsInNode = (node) => {
  if (!node) return 0;
  if (node.type === 'lesson') return 1;
  if (node.children && Array.isArray(node.children)) {
    return node.children.reduce((acc, child) => acc + countLessonsInNode(child), 0);
  }
  return 0;
};

// Generate random referral code if not exists
const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FREE-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function FreeCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Sidebar Active Tab: 'courses' | 'account' | 'checkin' | 'referral' | 'history'
  const [activeTab, setActiveTab] = useState('courses');

  // Pagination states for courses tab
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Auth User Check
  const accessToken = localStorage.getItem('accessToken');
  const storedUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const isLoggedIn = !!accessToken;
  const userKey = storedUser?.id ? `user_${storedUser.id}` : storedUser?.email ? `email_${storedUser.email}` : 'guest';
  const userName = storedUser?.name || storedUser?.fullName || storedUser?.username || (storedUser?.email ? storedUser.email.split('@')[0] : 'Học Viên Miễn Phí');
  const userEmail = storedUser?.email || 'Chưa đăng nhập';

  // Gamification & Points States
  const [userPoints, setUserPoints] = useState(30);
  const [streakDays, setStreakDays] = useState(0);
  const [lastCheckinDate, setLastCheckinDate] = useState('');
  const [historyLog, setHistoryLog] = useState([]);
  const [learnedHistory, setLearnedHistory] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralsCount, setReferralsCount] = useState(0);

  // Modals & Dropdowns
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [hasClickedShopee, setHasClickedShopee] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('roleName');
    setShowUserDropdown(false);
    showToast('👋 Đã đăng xuất tài khoản thành công!', 'info');
    window.location.reload();
  };

  // Auto detect URL ?ref= param for guest users to open Register Popup directly
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlRef = searchParams.get('ref');
    if (urlRef && !isLoggedIn) {
      setAuthInitialMode('register');
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  // Initial Load & Persistent LocalStorage Check
  useEffect(() => {
    fetchFreeCourses();
    initPointsData();
  }, [userKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const fetchFreeCourses = async () => {
    try {
      setLoading(true);
      const res = await freeCourse.getAll();
      let list = [];
      if (res && res.data) {
        if (Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res.data.data && Array.isArray(res.data.data.content)) {
          list = res.data.data.content;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        }
      }
      setCourses(list);
    } catch (error) {
      console.error('Error fetching free courses:', error);
      try {
        const fallbackRes = await freeCourse.getByDescription(0, 1000, '');
        let fallbackList = [];
        if (fallbackRes && fallbackRes.data) {
          if (fallbackRes.data.data && Array.isArray(fallbackRes.data.data.content)) {
            fallbackList = fallbackRes.data.data.content;
          } else if (Array.isArray(fallbackRes.data.data)) {
            fallbackList = fallbackRes.data.data;
          }
        }
        setCourses(fallbackList);
      } catch (err) {
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const initPointsData = async () => {
    if (isLoggedIn) {
      try {
        const [profileRes, historyRes, learnedRes] = await Promise.allSettled([
          freeUserService.getProfile(),
          freeUserService.getPointHistory(),
          freeUserService.getLearnedHistory()
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.data?.data) {
          const profile = profileRes.value.data.data;
          setUserPoints(profile.points ?? 30);
          setStreakDays(profile.streakDays ?? 0);
          setLastCheckinDate(profile.lastCheckinDate ?? '');
          setReferralCode(profile.referralCode ?? '');
          setReferralsCount(profile.referralsCount ?? 0);
        }

        if (historyRes.status === 'fulfilled' && historyRes.value?.data?.data) {
          setHistoryLog(historyRes.value.data.data);
        }

        if (learnedRes.status === 'fulfilled' && learnedRes.value?.data?.data) {
          setLearnedHistory(learnedRes.value.data.data);
        }
        return;
      } catch (err) {
        console.warn('Backend API connection warning, using local state:', err);
      }
    }

    const ptsKey = `free_course_user_points_${userKey}`;
    const streakKey = `free_course_checkin_streak_${userKey}`;
    const lastDateKey = `free_course_last_checkin_date_${userKey}`;
    const refCodeKey = `free_course_referral_code_${userKey}`;
    const refCountKey = `free_course_referrals_count_${userKey}`;
    const historyKey = `free_course_points_history_${userKey}`;
    const learnedKey = `free_course_learned_history_${userKey}`;

    // Points
    const storedPts = localStorage.getItem(ptsKey);
    if (storedPts !== null) {
      setUserPoints(parseInt(storedPts, 10));
    } else {
      localStorage.setItem(ptsKey, '30');
      setUserPoints(30);
    }

    // Streak
    const storedStreak = localStorage.getItem(streakKey);
    if (storedStreak !== null) {
      setStreakDays(parseInt(storedStreak, 10));
    } else {
      localStorage.setItem(streakKey, '0');
      setStreakDays(0);
    }

    // Last check-in date
    const storedLastDate = localStorage.getItem(lastDateKey) || '';
    setLastCheckinDate(storedLastDate);

    // Referral Code
    let refCode = localStorage.getItem(refCodeKey);
    if (!refCode) {
      refCode = generateReferralCode();
      localStorage.setItem(refCodeKey, refCode);
    }
    setReferralCode(refCode);

    // Referrals Count
    const refCount = localStorage.getItem(refCountKey) || '0';
    setReferralsCount(parseInt(refCount, 10));

    // Points History Log
    const storedHistory = localStorage.getItem(historyKey);
    if (storedHistory) {
      try {
        setHistoryLog(JSON.parse(storedHistory));
      } catch (e) {
        setHistoryLog([]);
      }
    } else {
      const initialLog = [
        {
          id: Date.now(),
          action: 'Thưởng Đăng Ký Tài Khoản Mới',
          points: '+30',
          date: new Date().toLocaleDateString('vi-VN'),
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ];
      localStorage.setItem(historyKey, JSON.stringify(initialLog));
      setHistoryLog(initialLog);
    }

    // Learned History Log
    const storedLearned = localStorage.getItem(learnedKey);
    if (storedLearned) {
      try {
        setLearnedHistory(JSON.parse(storedLearned));
      } catch (e) {
        setLearnedHistory([]);
      }
    } else {
      setLearnedHistory([]);
    }
  };

  const isCheckedInToday = () => {
    const todayStr1 = new Date().toDateString();
    const todayStr2 = new Date().toISOString().split('T')[0];
    return lastCheckinDate === todayStr1 || lastCheckinDate === todayStr2;
  };

  const handleOpenCheckinModal = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (isCheckedInToday()) {
      alert('🌟 Bạn đã điểm danh hôm nay rồi! Hãy quay lại sau 12h đêm để tiếp tục tích điểm nhé.');
      return;
    }
    setHasClickedShopee(false);
    setShowCheckinModal(true);
  };

  const handleConfirmCheckin = async () => {
    if (isLoggedIn) {
      try {
        const res = await freeUserService.performCheckin();
        if (res && res.data && res.data.data) {
          const profile = res.data.data;
          setUserPoints(profile.points);
          setStreakDays(profile.streakDays);
          setLastCheckinDate(profile.lastCheckinDate);

          freeUserService.getPointHistory().then(hRes => {
            if (hRes && hRes.data && hRes.data.data) {
              setHistoryLog(hRes.data.data);
            }
          }).catch(() => {});

          setShowCheckinModal(false);
          alert(`🎉 Điểm danh thành công Ngày ${profile.streakDays}! Bạn nhận được điểm thưởng.`);
          return;
        }
      } catch (err) {
        console.warn('API checkin failed, fallback local storage checkin:', err);
      }
    }

    const today = new Date();
    const todayStr = today.toDateString();

    if (lastCheckinDate === todayStr) {
      setShowCheckinModal(false);
      return;
    }

    // Calculate streak logic
    let newStreak = streakDays + 1;
    if (lastCheckinDate) {
      const lastDateObj = new Date(lastCheckinDate);
      const diffTime = Math.abs(today - lastDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 2) {
        newStreak = 1; // Reset streak if missed a full day
      }
    } else {
      newStreak = 1;
    }

    // Earned points: Day 1: +1pt, Day 2-6: +2pts/day, Day 7+: +5pts/day
    let earnedPts = 1;
    if (newStreak >= 7) {
      earnedPts = 5;
    } else if (newStreak >= 2) {
      earnedPts = 2;
    }

    const newPoints = userPoints + earnedPts;

    // Keys
    const ptsKey = `free_course_user_points_${userKey}`;
    const streakKey = `free_course_checkin_streak_${userKey}`;
    const lastDateKey = `free_course_last_checkin_date_${userKey}`;
    const historyKey = `free_course_points_history_${userKey}`;

    // Update States & LocalStorage
    setUserPoints(newPoints);
    setStreakDays(newStreak);
    setLastCheckinDate(todayStr);

    localStorage.setItem(ptsKey, newPoints.toString());
    localStorage.setItem(streakKey, newStreak.toString());
    localStorage.setItem(lastDateKey, todayStr);

    // Update History Log
    const newLogItem = {
      id: Date.now(),
      action: `Điểm Danh Shopee (Ngày ${newStreak})`,
      points: `+${earnedPts}`,
      date: today.toLocaleDateString('vi-VN'),
      time: today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedLog = [newLogItem, ...historyLog];
    setHistoryLog(updatedLog);
    localStorage.setItem(historyKey, JSON.stringify(updatedLog));

    setShowCheckinModal(false);
    alert(`🎉 Điểm danh thành công Ngày ${newStreak}! Bạn nhận được +${earnedPts} điểm thưởng.`);
  };

  const handleCopyText = (text, msg) => {
    navigator.clipboard.writeText(text);
    setCopySuccessMsg(msg);
    setTimeout(() => setCopySuccessMsg(''), 3000);
  };

  const handleCourseClick = (course) => {
    if (course) {
      navigate(`/khoa-hoc-free/${getSlugWithId(course.title, course.id)}`);
    }
  };

  // Build category tabs list dynamically combining presets & actual categories from backend
  const categoryTabs = [{ name: 'Tất cả', icon: <FaLayerGroup /> }];
  const iconMap = {
    'Ngoại ngữ': <FaLanguage />,
    'Lập trình': <FaLaptopCode />,
    'Kỹ năng mềm': <FaLightbulb />,
    'Thiết kế & Công nghệ': <FaCode />,
    'Khác': <FaFolderOpen />
  };

  const categoriesSet = new Set(['Ngoại ngữ', 'Lập trình', 'Kỹ năng mềm', 'Thiết kế & Công nghệ', 'Khác']);
  courses.forEach(c => {
    if (c.category && c.category.trim()) {
      categoriesSet.add(c.category.trim());
    }
  });

  Array.from(categoriesSet).forEach(catName => {
    categoryTabs.push({
      name: catName,
      icon: iconMap[catName] || <FaFolderOpen />
    });
  });

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      course.title?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'Tất cả' ||
      course.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedCourses = filteredCourses.slice(startIndex, startIndex + pageSize);

  // Parse structured tree data if available
  const getCourseStructure = (course) => {
    if (!course) return null;
    if (course.structure) {
      return typeof course.structure === 'string'
        ? JSON.parse(course.structure)
        : course.structure;
    }
    if (course.description) {
      let desc = course.description.trim();
      if (desc.startsWith('```')) {
        desc = desc.replace(/^```[a-zA-Z]*/, '').replace(/```$/, '').trim();
      }
      const firstBrace = desc.indexOf('{');
      const lastBrace = desc.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(desc.substring(firstBrace, lastBrace + 1));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  // Helper for Member Rank Title
  const getMemberRank = (pts) => {
    if (pts >= 200) return { title: 'Kim Cương 💎', color: '#38bdf8' };
    if (pts >= 100) return { title: 'Vàng 🌟', color: '#f59e0b' };
    if (pts >= 30) return { title: 'Bạc 🥈', color: '#94a3b8' };
    return { title: 'Đồng 🥉', color: '#b45309' };
  };

  const rankInfo = getMemberRank(userPoints);

  return (
    <div className="free-courses-page">
      <Navbar />

      {/* LOGIN REQUIRED NOTIFICATION BANNER IF NOT LOGGED IN */}
      {!isLoggedIn && (
        <div className="auth-required-banner">
          <div className="auth-banner-left">
            <FaLock className="auth-banner-icon" />
            <div>
              <h4>Đăng Nhập Hoặc Đăng Ký Để Lưu Lịch Sử Học Tập Khóa Học Free!</h4>
              <p>Tạo tài khoản miễn phí để lưu tiến trình học bài, tích 30 điểm khởi đầu và điểm danh Shopee hàng ngày.</p>
            </div>
          </div>
          <div className="auth-banner-btns">
            <button className="btn-login-now" onClick={() => setShowLoginModal(true)}>
              <FaSignInAlt /> Đăng Nhập
            </button>
            <button className="btn-register-now" onClick={() => setShowLoginModal(true)}>
              <FaUserCheck /> Đăng Ký Ngay
            </button>
          </div>
        </div>
      )}

      <main className="free-dashboard-layout">
        {/* VERTICAL SIDEBAR NAVIGATION */}
        <aside className="free-sidebar">
          <div className="free-sidebar-header">
            <div className="free-sidebar-logo-badge">
              <FaStar /> FREE HUB
            </div>

            {/* USER MINI PROFILE CARD WRAPPER WITH DROPDOWN */}
            <div className="free-user-mini-card-wrapper">
              <div
                className="free-user-mini-card"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                title="Bấm để mở menu tài khoản, đăng nhập & đăng xuất"
              >
                <div className="free-avatar-wrap">
                  <FaUserCircle className="free-avatar-icon" />
                </div>
                <div className="free-user-mini-info">
                  <span className="free-user-name">{userName}</span>
                  <span className="free-user-email">{userEmail}</span>
                </div>
                <div className="free-user-arrow">
                  <FaChevronDown className={`arrow-down-icon ${showUserDropdown ? 'open' : ''}`} />
                </div>
              </div>

              {/* USER PROFILE DROPDOWN MENU */}
              {showUserDropdown && (
                <div className="free-user-dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-title-name">{userName}</span>
                    <span className="dropdown-title-email">{userEmail}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item"
                    onClick={() => { setActiveTab('account'); setShowUserDropdown(false); }}
                  >
                    <FaUserCircle style={{ color: '#3b82f6' }} /> Xem Lịch Sử & Tài Khoản
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => { handleOpenCheckinModal(); setShowUserDropdown(false); }}
                  >
                    <FaCalendarCheck style={{ color: '#ef4444' }} /> Điểm Danh Shopee
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => { setActiveTab('referral'); setShowUserDropdown(false); }}
                  >
                    <FaGift style={{ color: '#10b981' }} /> Mời Bạn Bè (+5đ)
                  </button>
                  <div className="dropdown-divider"></div>
                  {isLoggedIn ? (
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt style={{ color: '#ef4444' }} /> Đăng Xuất Tài Khoản
                    </button>
                  ) : (
                    <button
                      className="dropdown-item login-btn"
                      onClick={() => { setShowLoginModal(true); setShowUserDropdown(false); }}
                    >
                      <FaSignInAlt style={{ color: '#3b82f6' }} /> Đăng Nhập / Đăng Ký
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="free-sidebar-nav">
            <button
              className={`free-sidebar-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <FaBookOpen className="free-sidebar-icon" />
              <span>Khóa Học Free</span>
              <span className="free-badge-count">{courses.length}</span>
            </button>

            <button
              className={`free-sidebar-btn ${activeTab === 'checkin' ? 'active' : ''}`}
              onClick={() => setActiveTab('checkin')}
            >
              <FaCalendarCheck className="free-sidebar-icon" />
              <span>Điểm Danh Shopee</span>
              {isCheckedInToday() ? (
                <span className="free-sidebar-tag tag-done">Đã xong</span>
              ) : (
                <span className="free-sidebar-tag tag-hot">HOT</span>
              )}
            </button>

            <button
              className={`free-sidebar-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <FaUserCircle className="free-sidebar-icon" />
              <span>Tài Khoản & Lịch Sử</span>
            </button>

            <button
              className={`free-sidebar-btn ${activeTab === 'referral' ? 'active' : ''}`}
              onClick={() => setActiveTab('referral')}
            >
              <FaUserPlus className="free-sidebar-icon" />
              <span>Mời Bạn Bè (+5đ)</span>
            </button>

            <button
              className={`free-sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory className="free-sidebar-icon" />
              <span>Nhật Ký Điểm</span>
            </button>

            <button
              className={`free-sidebar-btn ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <FaLightbulb className="free-sidebar-icon" style={{ color: '#f59e0b' }} />
              <span>Quy Chế Tích Điểm</span>
            </button>
          </nav>

          {/* Quick Check-in Banner Widget on Sidebar */}
          <div className="free-sidebar-widget">
            <div className="widget-header">
              <FaFire style={{ color: '#ef4444' }} /> Streak: <strong>{streakDays} Ngày</strong>
            </div>
            <p className="widget-desc">
              {isCheckedInToday()
                ? 'Đã điểm danh hôm nay! Quay lại sau 12h đêm.'
                : 'Điểm danh ngay qua Shopee nhận +1đ đến +5đ!'}
            </p>
            <button
              className="widget-btn"
              disabled={isCheckedInToday()}
              onClick={handleOpenCheckinModal}
            >
              {isCheckedInToday() ? '✅ Đã Điểm Danh' : '⚡ Điểm Danh Ngay'}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <section className="free-content-area">
          {/* TAB 1: DANH SÁCH KHÓA HỌC FREE */}
          {activeTab === 'courses' && (
            <div>
              {/* Header Title Section */}
              <div className="free-header-section">
                <h1 className="free-main-title">Khóa học FREE</h1>
                <p className="free-main-subtitle">
                  Nơi chia sẻ các khóa học Free miễn phí. Mọi người chịu khó điểm danh hàng ngày một chút để ủng hộ mình nha! ❤️<br />
                  Nếu bạn nào muốn học nhanh hơn và nhận trọn bộ 1 lần có thể{' '}
                  <span className="free-buy-link" onClick={() => navigate('/')}>
                    sang trang Mua Khóa Học (Trang Chủ)
                  </span>{' '}
                  để mua ủng hộ mình nha! ✨
                </p>

                {/* Search Box */}
                <div className="free-search-box">
                  <FaSearch className="free-search-icon" />
                  <input
                    type="text"
                    className="free-search-input"
                    placeholder="Tìm kiếm tài liệu, khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="free-categories-bar">
                {categoryTabs.map((cat, idx) => {
                  const isActive = selectedCategory === cat.name;
                  return (
                    <button
                      key={idx}
                      className={`free-cat-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Course Items List */}
              {loading ? (
                <div className="free-list-container">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div key={idx} className="free-list-row" style={{ opacity: 0.5 }}>
                      <div className="free-row-left">
                        <div style={{ width: 24, height: 16, background: '#334155', borderRadius: 4 }} />
                        <div className="free-row-icon-badge" style={{ background: '#334155' }} />
                        <div className="free-row-content">
                          <div style={{ height: 18, background: '#334155', borderRadius: 4, width: '40%' }} />
                          <div style={{ height: 14, background: '#1e293b', borderRadius: 4, width: '25%', marginTop: 4 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="free-empty">
                  <FaInfoCircle className="free-empty-icon" />
                  <h3 className="free-empty-title">Chưa có tài liệu nào trong danh mục này</h3>
                  <p className="free-empty-desc">
                    Vui lòng thử chọn danh mục khác hoặc thay đổi từ khóa tìm kiếm.
                  </p>
                </div>
              ) : (
                <>
                  <div className="free-list-container">
                    {pagedCourses.map((course, index) => {
                      const structureTree = getCourseStructure(course);
                      const itemsCount = structureTree
                        ? countLessonsInNode(structureTree)
                        : course.items
                        ? course.items.length
                        : 1;

                      const viewCount = course.views != null ? course.views : 0;
                      const actualIndex = startIndex + index + 1;

                      return (
                        <div
                          key={course.id}
                          className="free-list-row"
                          onClick={() => handleCourseClick(course)}
                        >
                          <div className="free-row-left">
                            <span className="free-row-index">{actualIndex}</span>
                            <div className="free-row-icon-badge">
                              <FaFileAlt />
                            </div>
                            <div className="free-row-content">
                              <span className="free-row-title">{course.title}</span>
                              <div className="free-row-meta">
                                <span className="free-row-category-badge">{course.category || 'Tài liệu'}</span>
                                <span className="free-row-count">
                                  <FaPlayCircle style={{ color: '#38bdf8' }} /> {itemsCount} bài học / tài liệu
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="free-row-right">
                            <div className="free-row-stats">
                              <FaEye /> {viewCount}
                            </div>
                            <button
                              className="free-btn-action-pill"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCourseClick(course);
                              }}
                            >
                              XEM <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: ĐIỂM DANH SHOPEE */}
          {activeTab === 'checkin' && (
            <div className="free-tab-container">
              <div className="free-tab-header">
                <h2><FaCalendarCheck style={{ color: '#38bdf8' }} /> Điểm Danh Nhận Điểm Hàng Ngày</h2>
                <p>Điểm danh mỗi ngày bằng cách ủng hộ 1 click link Shopee Admin để nhận điểm tích lũy đổi quà!</p>
              </div>

              {/* Checkin Status Card */}
              <div className="checkin-status-card">
                <div className="streak-badge-box">
                  <FaFire className="streak-icon" />
                  <div>
                    <span className="streak-title">Chuỗi Điểm Danh</span>
                    <h3 className="streak-days">{streakDays} Ngày Liên Tiếp</h3>
                  </div>
                </div>
                <div className="checkin-action-area">
                  <p className="checkin-hint">
                    {isCheckedInToday()
                      ? '✨ Bạn đã hoàn thành điểm danh hôm nay! Hệ thống sẽ reset mốc điểm danh sau 12h đêm.'
                      : '👉 Nhấn nút bên dưới để mở Popup Shopee và nhận điểm thưởng ngay!'}
                  </p>
                  <button
                    className={`free-big-action-btn ${isCheckedInToday() ? 'disabled' : ''}`}
                    disabled={isCheckedInToday()}
                    onClick={handleOpenCheckinModal}
                  >
                    {isCheckedInToday() ? (
                      <> <FaCheckCircle /> Đã Điểm Danh Hôm Nay </>
                    ) : (
                      <> <FaShoppingBag /> Bấm Điểm Danh Qua Shopee </>
                    )}
                  </button>
                </div>
              </div>

              {/* 7-Day Streak Rewards Matrix */}
              <h3 className="matrix-title"><FaGift style={{ color: '#f59e0b' }} /> Phân Bố Thưởng Chuỗi 7 Ngày</h3>
              <div className="streak-grid">
                {[
                  { day: 1, pts: '+1 Điểm', desc: 'Khởi đầu' },
                  { day: 2, pts: '+2 Điểm', desc: 'Duy trì' },
                  { day: 3, pts: '+2 Điểm', desc: 'Duy trì' },
                  { day: 4, pts: '+2 Điểm', desc: 'Duy trì' },
                  { day: 5, pts: '+2 Điểm', desc: 'Duy trì' },
                  { day: 6, pts: '+2 Điểm', desc: 'Tăng tốc' },
                  { day: 7, pts: '+5 Điểm', desc: 'Đỉnh cao 🔥' }
                ].map((item) => {
                  const isPast = streakDays >= item.day;
                  const isCurrent = streakDays + 1 === item.day && !isCheckedInToday();
                  return (
                    <div
                      key={item.day}
                      className={`streak-card ${isPast ? 'completed' : ''} ${isCurrent ? 'active-today' : ''}`}
                    >
                      <span className="day-label">Ngày {item.day}</span>
                      <span className="pts-reward">{item.pts}</span>
                      <span className="day-desc">{item.desc}</span>
                      {isPast && <FaCheckCircle className="check-icon" />}
                    </div>
                  );
                })}
              </div>

              <div className="checkin-rules-box">
                <h4>📌 Quy Tắc Điểm Danh & Tích Điểm:</h4>
                <ul>
                  <li>Mỗi ngày 1 trình duyệt/tài khoản được điểm danh 1 lần duy nhất.</li>
                  <li>Mốc điểm danh được **reset tự động sau 12h đêm (00:00 AM)** hàng ngày.</li>
                  <li>Xem 1 bài học / video sẽ tiêu hao **-1 điểm**. Đăng ký tài khoản nhận ngay **30 điểm khởi đầu**.</li>
                  <li>Nếu bạn quên điểm danh 1 ngày, chuỗi streak sẽ được tính lại từ Ngày 1. Từ Ngày 7 trở đi giữ nguyên mốc thưởng 5 điểm/ngày.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TÀI KHOẢN & LỊCH SỬ HỌC TẬP */}
          {activeTab === 'account' && (
            <div className="free-tab-container">
              <div className="free-tab-header">
                <h2><FaUserCircle style={{ color: '#3b82f6' }} /> Thông Tin Tài Khoản & Lịch Sử Học Tập</h2>
                <p>Xem chi tiết tiến trình các khóa học đã xem và điểm số cá nhân.</p>
              </div>

              <div className="account-overview-grid">
                {/* Profile Info Card */}
                <div className="account-card profile-card">
                  <div className="profile-header-wrap">
                    <FaUserCircle className="big-avatar" />
                    <div>
                      <h3 className="profile-name">{userName}</h3>
                      <span className="profile-role">{userEmail}</span>
                    </div>
                  </div>
                  <div className="profile-details-list">
                    <div className="detail-item">
                      <span>Trạng Thái Đăng Nhập:</span>
                      <strong style={{ color: isLoggedIn ? '#10b981' : '#f59e0b' }}>
                        {isLoggedIn ? '✅ Đã Đăng Nhập' : '🔒 Chưa Đăng Nhập'}
                      </strong>
                    </div>
                    <div className="detail-item">
                      <span>Mã Giới Thiệu:</span>
                      <strong>{referralCode}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Cấp Độ Thành Viên:</span>
                      <strong style={{ color: rankInfo.color }}>{rankInfo.title}</strong>
                    </div>
                  </div>
                </div>

                {/* Points Card */}
                <div className="account-card points-card">
                  <div className="points-header">
                    <FaCoins className="big-coin-icon" />
                    <div>
                      <span className="pts-label">Số Dư Điểm Hiện Tại</span>
                      <h1 className="pts-number">{userPoints} <span className="pts-unit">Điểm</span></h1>
                    </div>
                  </div>
                  <div className="rank-progress-area">
                    <div className="rank-progress-labels">
                      <span>Hạng Hiện Tại: <strong style={{ color: rankInfo.color }}>{rankInfo.title}</strong></span>
                      <span>Mục Tiêu: 100 Điểm</span>
                    </div>
                    <div className="rank-bar-outer">
                      <div
                        className="rank-bar-inner"
                        style={{ width: `${Math.min(100, (userPoints / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Watched Lessons History Card */}
              <h3 className="perks-title"><FaGraduationCap style={{ color: '#38bdf8' }} /> Lịch Sử Bài Học Đã Học</h3>
              <div className="learned-history-card">
                {learnedHistory.length === 0 ? (
                  <div className="empty-learned">
                    <FaBookOpen style={{ fontSize: '2.5rem', color: '#475569' }} />
                    <p>Bạn chưa có lịch sử học bài. Hãy chọn 1 khóa học trong danh sách để bắt đầu xem video!</p>
                  </div>
                ) : (
                  <div className="learned-list">
                    {learnedHistory.map((item, idx) => (
                      <div key={idx} className="learned-item">
                        <div className="learned-item-left">
                          <FaPlayCircle style={{ color: '#38bdf8', fontSize: '1.2rem', flexShrink: 0 }} />
                          <div>
                            <span className="learned-title">{item.action}</span>
                            <span className="learned-time">{item.date} {item.time}</span>
                          </div>
                        </div>
                        <span className="learned-status-tag">Đã Xem (-1đ)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MỜI BẠN BÈ */}
          {activeTab === 'referral' && (
            <div className="free-tab-container">
              <div className="free-tab-header">
                <h2><FaUserPlus style={{ color: '#10b981' }} /> Mời Bạn Bè Đăng Ký (+5 Điểm / Lượt)</h2>
                <p>Chia sẻ mã hoặc đường link giới thiệu cho bạn bè. Nhận ngay 5 điểm khi họ tham gia!</p>
              </div>

              <div className="referral-hero-card">
                <div className="ref-hero-content">
                  <span className="ref-hero-badge"><FaGift /> THƯỞNG GIỚI THIỆU</span>
                  <h2>Tặng 5 Điểm Cho Mỗi Lượt Giới Thiệu Thành Công</h2>
                  <p>Lan tỏa tri thức miễn phí cho cộng đồng và nhận điểm thưởng không giới hạn!</p>
                </div>
              </div>

              <div className="referral-box-grid">
                {/* Ref Code Box */}
                <div className="ref-box">
                  <label className="ref-label">Mã Giới Thiệu Của Bạn</label>
                  <div className="ref-input-group">
                    <input type="text" readOnly value={referralCode} className="ref-input" />
                    <button
                      className="ref-copy-btn"
                      onClick={() => handleCopyText(referralCode, 'Đã sao chép mã giới thiệu!')}
                    >
                      <FaCopy /> Copy Mã
                    </button>
                  </div>
                </div>

                {/* Ref Link Box */}
                <div className="ref-box">
                  <label className="ref-label">Link Chia Sẻ Trực Tiếp</label>
                  <div className="ref-input-group">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/khoa-hoc-free?ref=${referralCode}`}
                      className="ref-input"
                    />
                    <button
                      className="ref-copy-btn"
                      onClick={() =>
                        handleCopyText(
                          `${window.location.origin}/khoa-hoc-free?ref=${referralCode}`,
                          'Đã sao chép đường link giới thiệu!'
                        )
                      }
                    >
                      <FaCopy /> Copy Link
                    </button>
                  </div>
                </div>
              </div>

              {copySuccessMsg && (
                <div className="copy-toast">
                  <FaCheck /> {copySuccessMsg}
                </div>
              )}

              <div className="ref-stats-grid">
                <div className="ref-stat-box">
                  <div className="stat-icon-wrap icon-emerald">
                    <FaUserPlus />
                  </div>
                  <div className="stat-info-wrap">
                    <span className="stat-label">Tổng Bạn Bè Đã Mời</span>
                    <h3 className="stat-value">{referralsCount} <span className="stat-unit">Người</span></h3>
                  </div>
                </div>
                <div className="ref-stat-box">
                  <div className="stat-icon-wrap icon-amber">
                    <FaCoins />
                  </div>
                  <div className="stat-info-wrap">
                    <span className="stat-label">Điểm Nhận Từ Giới Thiệu</span>
                    <h3 className="stat-value">+{referralsCount * 5} <span className="stat-unit">Điểm</span></h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LỊCH SỬ ĐIỂM */}
          {activeTab === 'history' && (
            <div className="free-tab-container">
              <div className="free-tab-header">
                <h2><FaHistory style={{ color: '#8b5cf6' }} /> Lịch Sử Biến Động Điểm</h2>
                <p>Theo dõi chi tiết các lượt tích điểm từ điểm danh, xem bài học và thưởng đăng ký.</p>
              </div>

              <div className="history-table-card">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Hành Động / Hoạt Động</th>
                      <th>Thời Gian</th>
                      <th>Biến Động Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLog.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          Chưa có lịch sử điểm danh.
                        </td>
                      </tr>
                    ) : (
                      historyLog.map((log, index) => (
                        <tr key={log.id || index}>
                          <td>{index + 1}</td>
                          <td className="action-cell">{log.action}</td>
                          <td className="time-cell">{log.date} {log.time}</td>
                          <td className={`points-cell ${log.points?.startsWith('-') ? 'loss' : 'gain'}`}>
                            {log.points} Điểm
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: QUY CHẾ TÍCH ĐIỂM */}
          {activeTab === 'rules' && (
            <div className="free-tab-container">
              <div className="free-tab-header">
                <h2><FaLightbulb style={{ color: '#f59e0b' }} /> Quy Chế Tích Điểm & Đổi Thưởng</h2>
                <p>Bảng tổng hợp đầy đủ các chính sách tích điểm, thưởng chuỗi đăng nhập và mở khóa bài học tại Free Hub.</p>
              </div>

              <div className="rules-grid">
                {/* Rule 1: Thưởng Đăng Ký */}
                <div className="rule-card">
                  <div className="rule-icon-box bg-emerald">
                    <FaUserCheck />
                  </div>
                  <div className="rule-content">
                    <h4>1. Thưởng Đăng Ký Mới</h4>
                    <div className="rule-badge badge-green">+30 Điểm Thưởng</div>
                    <p>Học viên tạo tài khoản mới thành công nhận ngay <strong>30 điểm thưởng</strong> vào số dư cá nhân.</p>
                  </div>
                </div>

                {/* Rule 2: Điểm Danh Shopee Hàng Ngày */}
                <div className="rule-card">
                  <div className="rule-icon-box bg-amber">
                    <FaCalendarCheck />
                  </div>
                  <div className="rule-content">
                    <h4>2. Điểm Danh Shopee Hàng Ngày</h4>
                    <div className="rule-badge badge-amber">+1đ đến +5đ / ngày</div>
                    <ul className="rule-list">
                      <li><strong>Ngày 1:</strong> Thưởng <strong>+1 điểm</strong></li>
                      <li><strong>Ngày 2 đến 6:</strong> Thưởng <strong>+2 điểm/ngày</strong></li>
                      <li><strong>Ngày 7 trở đi (Chuỗi Streak):</strong> Thưởng <strong>+5 điểm/ngày</strong></li>
                    </ul>
                  </div>
                </div>

                {/* Rule 3: Quy Tắc Học Bài Hàng Ngày */}
                <div className="rule-card">
                  <div className="rule-icon-box bg-sky">
                    <FaPlayCircle />
                  </div>
                  <div className="rule-content">
                    <h4>3. Quy Tắc Học Bài Hàng Ngày</h4>
                    <div className="rule-badge badge-sky">5 bài đầu miễn phí (+1đ/bài)</div>
                    <ul className="rule-list">
                      <li><strong>5 bài lẻ đầu tiên trong ngày:</strong> Học Miễn Phí & CỘNG <strong>+1 điểm/bài</strong> (Tích tối đa +5đ/ngày).</li>
                      <li><strong>Từ bài thứ 6 trở đi trong ngày:</strong> Không cộng điểm & TRỪ <strong>1 điểm/bài</strong> (-1đ) để tiếp tục mở bài học.</li>
                    </ul>
                  </div>
                </div>

                {/* Rule 4: Kích Hoạt Trọn Bộ Khóa Học */}
                <div className="rule-card">
                  <div className="rule-icon-box bg-purple">
                    <FaFolderOpen />
                  </div>
                  <div className="rule-content">
                    <h4>4. Kích Hoạt Trọn Bộ Khóa Học (-20đ)</h4>
                    <div className="rule-badge badge-purple">Trừ 20 Điểm Số Dư</div>
                    <p>Dùng <strong>20 điểm thưởng</strong> từ số dư để kích hoạt trọn bộ khóa học. Sau khi kích hoạt, bạn có thể xem tất cả bài học trong khóa học này hoàn toàn không giới hạn.</p>
                  </div>
                </div>

                {/* Rule 5: Giới Thiệu Bạn Bè */}
                <div className="rule-card">
                  <div className="rule-icon-box bg-pink">
                    <FaUserPlus />
                  </div>
                  <div className="rule-content">
                    <h4>5. Giới Thiệu Bạn Bè</h4>
                    <div className="rule-badge badge-pink">+5 Điểm / người</div>
                    <p>Mời bạn bè tạo tài khoản qua mã giới thiệu cá nhân nhận ngay <strong>+5 điểm thưởng</strong> cho mỗi lượt mời.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* LOGIN PROMPT POPUP MODAL */}
      <AuthPopupModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccessLogin={() => initPointsData()}
        initialMode={authInitialMode}
      />

      {/* SHOPEE CHECKIN MODAL POPUP */}
      {showCheckinModal && (
        <div className="free-shopee-overlay" onClick={() => setShowCheckinModal(false)}>
          <div className="free-shopee-box" onClick={(e) => e.stopPropagation()}>
            <button className="shopee-close-x-btn" onClick={() => setShowCheckinModal(false)} title="Đóng">
              <span className="shopee-x-text">✕</span>
            </button>
            <span className="free-shopee-heart">❤️</span>
            <h2 className="free-shopee-title">Điểm Danh Hàng Ngày Qua Shopee</h2>
            <p className="free-shopee-text">
              Ủng hộ Admin 1 click link Shopee để duy trì kho tài liệu miễn phí và nhận điểm thưởng tích lũy ngay!
            </p>
            <a
              href={SHOPEE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="free-shopee-btn-buy"
              onClick={() => setHasClickedShopee(true)}
            >
              <FaShoppingBag /> Ghé Shopee Ủng Hộ (Mở Shopee)
            </a>
            <button
              className="free-shopee-btn-close"
              disabled={!hasClickedShopee}
              onClick={handleConfirmCheckin}
              style={
                !hasClickedShopee
                  ? {
                      background: '#e2e8f0',
                      color: '#94a3b8',
                      cursor: 'not-allowed',
                      border: '1px solid #cbd5e1',
                      opacity: 0.75,
                      boxShadow: 'none'
                    }
                  : {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }
              }
            >
              {hasClickedShopee ? "✨ Xác Nhận Điểm Danh & Nhận Điểm" : "🔒 Vui lòng click link Shopee phía trên trước"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
