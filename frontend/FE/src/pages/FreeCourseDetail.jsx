import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import freeCourse from '../services/freeCourse';
import freeUserService from '../services/freeUserService';
import AuthPopupModal from '../components/AuthPopupModal';
import { slugify, extractIdFromSlug, getSlugWithId } from '../utils/slugify';
import {
  FaArrowLeft,
  FaBookOpen,
  FaPlayCircle,
  FaFolder,
  FaChevronDown,
  FaChevronRight,
  FaBookmark,
  FaExternalLinkAlt,
  FaSpinner,
  FaEye,
  FaInfoCircle,
  FaLayerGroup,
  FaShoppingBag,
  FaLock,
  FaSignInAlt,
  FaUserCheck
} from 'react-icons/fa';
import './FreeCourseDetail.css';

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

// Helper to count chapters recursively
const countChaptersInNode = (node) => {
  if (!node) return 0;
  let count = node.type === 'chapter' ? 1 : 0;
  if (node.children && Array.isArray(node.children)) {
    count += node.children.reduce((acc, child) => acc + countChaptersInNode(child), 0);
  }
  return count;
};

// Recursive Component for Tree Nodes (Chapter / Folder / Lesson)
function CourseTreeNode({ node, depth = 0, onLessonClick }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!node) return null;

  const nodeType = node.type || (node.children ? 'folder' : 'lesson');
  const nodeTitle = node.title || node.name || 'Không có tiêu đề';
  const nodeUrl = node.url || node.link;

  if (nodeType === 'chapter') {
    const totalLessons = countLessonsInNode(node);
    return (
      <div className="tree-node-chapter">
        <div
          className="tree-chapter-header"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="tree-chapter-title">
            <FaBookmark style={{ color: '#38bdf8' }} />
            <span>{nodeTitle}</span>
            {totalLessons > 0 && (
              <span className="free-count-badge" style={{ fontSize: '0.75rem' }}>
                {totalLessons} bài
              </span>
            )}
          </div>
          {node.children && node.children.length > 0 && (
            <div style={{ color: '#94a3b8' }}>
              {isOpen ? <FaChevronDown /> : <FaChevronRight />}
            </div>
          )}
        </div>

        {isOpen && node.children && (
          <div style={{ padding: '8px 16px 16px' }}>
            {node.children.map((child, idx) => (
              <CourseTreeNode key={idx} node={child} depth={depth + 1} onLessonClick={onLessonClick} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (nodeType === 'folder') {
    return (
      <div className="tree-node-folder">
        <div
          className="tree-folder-header"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaChevronDown style={{ fontSize: '0.75rem' }} /> : <FaChevronRight style={{ fontSize: '0.75rem' }} />}
          <FaFolder style={{ color: '#f59e0b' }} />
          <span>{nodeTitle}</span>
        </div>

        {isOpen && node.children && (
          <div className="tree-folder-children">
            {node.children.map((child, idx) => (
              <CourseTreeNode key={idx} node={child} depth={depth + 1} onLessonClick={onLessonClick} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Lesson Node
  return (
    <div className="tree-node-lesson">
      <div className="tree-lesson-info">
        <FaPlayCircle className="tree-lesson-icon" />
        <span className="tree-lesson-title">{nodeTitle}</span>
      </div>
      {nodeUrl ? (
        <a
          href={nodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tree-lesson-btn"
          onClick={(e) => {
            e.preventDefault();
            if (onLessonClick) onLessonClick(nodeUrl);
          }}
        >
          Học Ngay <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
        </a>
      ) : (
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
          Đang cập nhật link
        </span>
      )}
    </div>
  );
}

export default function FreeCourseDetail() {
  const navigate = useNavigate();
  const { slug, id } = useParams();
  const routeParam = slug || id;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth User Check
  const accessToken = localStorage.getItem('accessToken');
  const storedUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const isLoggedIn = !!accessToken;
  const userKey = storedUser?.id ? `user_${storedUser.id}` : storedUser?.email ? `email_${storedUser.email}` : 'guest';

  // Shopee Sponsor Modal States
  const [showShopeeModal, setShowShopeeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [hasClickedShopee, setHasClickedShopee] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [routeParam]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const numericId = extractIdFromSlug(routeParam);

      // Try getById first if numericId is valid
      if (numericId && !isNaN(numericId)) {
        try {
          const res = await freeCourse.getById(numericId);
          if (res && res.data && res.data.data) {
            const courseData = res.data.data;
            setCourse(courseData);
            setLoading(false);
            freeCourse.incrementView(courseData.id).then(r => {
              if (r && r.data && r.data.data && r.data.data.views != null) {
                setCourse(prev => ({ ...prev, views: r.data.data.views }));
              }
            }).catch(() => {});
            return;
          }
        } catch (ignored) {}
      }

      // Fallback find in getAll list
      const listRes = await freeCourse.getAll();
      let list = [];
      if (listRes && listRes.data) {
        if (Array.isArray(listRes.data.data)) {
          list = listRes.data.data;
        } else if (listRes.data.data && Array.isArray(listRes.data.data.content)) {
          list = listRes.data.data.content;
        }
      }

      const found = list.find((c) => {
        if (numericId && c.id === numericId) return true;
        if (getSlugWithId(c.title, c.id) === routeParam) return true;
        if (slugify(c.title) === routeParam) return true;
        return String(c.id) === String(routeParam);
      });

      if (found) {
        setCourse(found);
        freeCourse.incrementView(found.id).then(r => {
          if (r && r.data && r.data.data && r.data.data.views != null) {
            setCourse(prev => ({ ...prev, views: r.data.data.views }));
          }
        }).catch(() => {});
      } else {
        setError('Không tìm thấy thông tin khóa học này.');
      }
    } catch (err) {
      console.error('Error fetching free course detail:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu khóa học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course && course.id) {
      setIsUnlocked(isCourseUnlocked(course.id));
    }
  }, [course, userKey]);

  // Helper to check if full course is already unlocked by user
  const isCourseUnlocked = (courseId) => {
    if (!courseId) return false;
    const unlockedKey = `free_unlocked_courses_${userKey}`;
    try {
      const list = JSON.parse(localStorage.getItem(unlockedKey) || '[]');
      return list.includes(courseId);
    } catch (e) {
      return false;
    }
  };

  const handleConfirmUnlockCourse = () => {
    if (!course || !course.id) return;
    const ptsKey = `free_course_user_points_${userKey}`;
    const currentPts = parseInt(localStorage.getItem(ptsKey) || '30', 10);

    if (currentPts < 20) {
      alert(`⚠️ Bạn cần 20 điểm thưởng để kích hoạt trọn bộ khóa học này!\n\n- Số dư hiện tại của bạn: ${currentPts} điểm\n- Hãy điểm danh Shopee (+1đ đến +5đ/ngày) hoặc mời bạn bè (+5đ/người) để tích đủ 20 điểm nhé.`);
      return;
    }

    if (window.confirm(`🔓 KÍCH HOẠT TRỌN BỘ KHÓA HỌC?\n\nTên khóa: ${course.title}\n- Chi phí kích hoạt: Trừ 20 điểm từ số dư tài khoản\n- Số dư hiện tại: ${currentPts} điểm\n- Số dư còn lại sau khi trừ: ${currentPts - 20} điểm\n\nSau khi kích hoạt, bạn có thể học tất cả bài học trong khóa học này không bị giới hạn bài lẻ!`)) {
      const success = unlockFullCoursePoint();
      if (success) {
        setIsUnlocked(true);
        alert(`🎉 Kích hoạt trọn bộ khóa học "${course.title}" thành công!\nĐã trừ 20 điểm thưởng từ số dư tài khoản của bạn.`);
      }
    }
  };

  // Helper to handle daily lesson limits: 5 free lessons per day (+1pt), lessons beyond 5 deduct 2pts (-2pts)
  const completeLessonPoint = (lessonTitleParam = 'Bài học') => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const countKey = `free_daily_lessons_count_${todayStr}_${userKey}`;
      const ptsKey = `free_course_user_points_${userKey}`;
      const historyKey = `free_course_points_history_${userKey}`;
      const learnedKey = `free_course_learned_history_${userKey}`;

      const currentCount = parseInt(localStorage.getItem(countKey) || '0', 10);
      const currentPts = parseInt(localStorage.getItem(ptsKey) || '30', 10);
      const today = new Date();
      const courseTitle = course ? course.title : 'Khóa Học Free';

      // If course is already activated/unlocked by paying 30 points, allow instant access without daily limit
      if (course?.id && isCourseUnlocked(course.id)) {
        if (isLoggedIn) {
          freeUserService.completeLesson(course?.id, course?.title, lessonTitleParam).catch(() => {});
        }
        return true;
      }

      if (currentCount < 5) {
        // First 5 lessons of day: FREE & Award +1 Point
        localStorage.setItem(countKey, (currentCount + 1).toString());
        const newPts = currentPts + 1;
        localStorage.setItem(ptsKey, newPts.toString());

        if (isLoggedIn) {
          freeUserService.completeLesson(course?.id, course?.title, lessonTitleParam).catch(() => {});
        }

        const newLogItem = {
          id: Date.now(),
          action: `Học Bài Mới (+1đ) (${lessonTitleParam.substring(0, 30)})`,
          points: '+1',
          date: today.toLocaleDateString('vi-VN'),
          time: today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        const existingHistoryStr = localStorage.getItem(historyKey);
        let historyList = [];
        if (existingHistoryStr) {
          try { historyList = JSON.parse(existingHistoryStr); } catch (ignored) {}
        }
        localStorage.setItem(historyKey, JSON.stringify([newLogItem, ...historyList]));

        const learnedItem = {
          id: Date.now(),
          courseId: course?.id,
          action: `${courseTitle} - ${lessonTitleParam}`,
          date: today.toLocaleDateString('vi-VN'),
          time: today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        const existingLearnedStr = localStorage.getItem(learnedKey);
        let learnedList = [];
        if (existingLearnedStr) {
          try { learnedList = JSON.parse(existingLearnedStr); } catch (ignored) {}
        }
        localStorage.setItem(learnedKey, JSON.stringify([learnedItem, ...learnedList]));

        return true;
      } else {
        // Beyond 5 lessons per day: Require & Deduct 1 Point (-1pt)
        if (currentPts < 1) {
          alert(`⚠️ Bạn đã học hết 5 bài miễn phí hôm nay!\nĐể mở học tiếp bài "${lessonTitleParam}" cần 1 điểm thưởng (Hiện tại bạn có ${currentPts}đ).\nHãy Điểm danh Shopee hoặc Mời bạn bè để tích thêm điểm nhé.`);
          return false;
        }

        localStorage.setItem(countKey, (currentCount + 1).toString());
        const newPts = currentPts - 1;
        localStorage.setItem(ptsKey, newPts.toString());

        if (isLoggedIn) {
          freeUserService.completeLesson(course?.id, course?.title, lessonTitleParam).catch(() => {});
        }

        const newLogItem = {
          id: Date.now(),
          action: `Mở Bài Học Tiếp Theo (-1đ) (${lessonTitleParam.substring(0, 30)})`,
          points: '-1',
          date: today.toLocaleDateString('vi-VN'),
          time: today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        const existingHistoryStr = localStorage.getItem(historyKey);
        let historyList = [];
        if (existingHistoryStr) {
          try { historyList = JSON.parse(existingHistoryStr); } catch (ignored) {}
        }
        localStorage.setItem(historyKey, JSON.stringify([newLogItem, ...historyList]));

        return true;
      }
    } catch (e) {
      console.error('Error completing lesson point:', e);
      return true;
    }
  };

  // Helper to deduct 20 points to unlock full course
  const unlockFullCoursePoint = () => {
    try {
      const ptsKey = `free_course_user_points_${userKey}`;
      const historyKey = `free_course_points_history_${userKey}`;
      const unlockedKey = `free_unlocked_courses_${userKey}`;

      const currentPts = parseInt(localStorage.getItem(ptsKey) || '30', 10);
      if (currentPts < 20) {
        alert(`⚠️ Bạn cần 20 điểm để mở trọn bộ khóa học này! Hiện tại bạn có ${currentPts}đ.\nHãy học các bài lẻ (+1đ/bài) hoặc Điểm danh Shopee hàng ngày để tích đủ điểm nhé.`);
        return false;
      }

      const newPts = currentPts - 20;
      localStorage.setItem(ptsKey, newPts.toString());

      // Mark course as unlocked
      let unlockedList = [];
      try {
        unlockedList = JSON.parse(localStorage.getItem(unlockedKey) || '[]');
      } catch (e) {}
      if (course?.id && !unlockedList.includes(course.id)) {
        unlockedList.push(course.id);
        localStorage.setItem(unlockedKey, JSON.stringify(unlockedList));
      }

      if (isLoggedIn) {
        freeUserService.unlockCourse(course?.id, course?.title)
          .catch(err => console.warn('API unlockCourse error, fallback local storage:', err));
      }

      const today = new Date();
      const courseTitle = course ? course.title : 'Khóa Học Free';

      // Log Points History (-20 points)
      const newLogItem = {
        id: Date.now(),
        action: `Mở Trọn Bộ Khóa Học (-20đ) (${courseTitle.substring(0, 30)}...)`,
        points: '-20',
        date: today.toLocaleDateString('vi-VN'),
        time: today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      const existingHistoryStr = localStorage.getItem(historyKey);
      let historyList = [];
      if (existingHistoryStr) {
        try { historyList = JSON.parse(existingHistoryStr); } catch (ignored) {}
      }
      localStorage.setItem(historyKey, JSON.stringify([newLogItem, ...historyList]));

      return true;
    } catch (e) {
      console.error('Error unlocking full course:', e);
      return true;
    }
  };

  // Helper to perform automatic daily check-in when confirming Shopee popup
  const performDailyCheckinIfNeeded = () => {
    try {
      if (isLoggedIn) {
        freeUserService.performCheckin()
          .catch(err => console.warn('API performCheckin error, fallback local storage:', err));
      }

      const today = new Date();
      const todayStr = today.toDateString();

      const lastDateKey = `free_course_last_checkin_date_${userKey}`;
      const streakKey = `free_course_checkin_streak_${userKey}`;
      const ptsKey = `free_course_user_points_${userKey}`;
      const historyKey = `free_course_points_history_${userKey}`;

      const lastCheckin = localStorage.getItem(lastDateKey) || '';

      if (lastCheckin !== todayStr) {
        // Perform auto check-in for today!
        const currentStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);
        let newStreak = currentStreak + 1;

        if (lastCheckin) {
          const lastDateObj = new Date(lastCheckin);
          const diffTime = Math.abs(today - lastDateObj);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 2) {
            newStreak = 1; // Reset streak if missed a day
          }
        } else {
          newStreak = 1;
        }

        let earnedPts = 1;
        if (newStreak >= 7) {
          earnedPts = 5;
        } else if (newStreak >= 2) {
          earnedPts = 2;
        }

        const currentPts = parseInt(localStorage.getItem(ptsKey) || '30', 10);
        const newPts = currentPts + earnedPts;

        localStorage.setItem(ptsKey, newPts.toString());
        localStorage.setItem(streakKey, newStreak.toString());
        localStorage.setItem(lastDateKey, todayStr);

        // Add history log entry for Check-in
        const newLogItem = {
          id: Date.now(),
          action: `Điểm Danh Shopee (Ngày ${newStreak})`,
          points: `+${earnedPts}`,
          date: today.toLocaleDateString('vi-VN'),
          time: today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        const existingHistoryStr = localStorage.getItem(historyKey);
        let historyList = [];
        if (existingHistoryStr) {
          try { historyList = JSON.parse(existingHistoryStr); } catch (ignored) {}
        }
        localStorage.setItem(historyKey, JSON.stringify([newLogItem, ...historyList]));
      }
    } catch (e) {
      console.error('Error performing auto check-in:', e);
    }
  };

  // Main lesson/course click handler
  const handleLessonClick = (url, isFullCourse = false, lessonTitle = 'Bài học') => {
    if (!url || url === '#') return;

    if (!isLoggedIn) {
      setPendingUrl(url);
      setShowLoginModal(true);
      return;
    }

    // Unlocking full course costs 30 points
    if (isFullCourse) {
      if (isCourseUnlocked(course?.id)) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      const confirmUnlock = window.confirm(`🔓 Bạn có muốn dùng 30 điểm thưởng để mở TRỌN BỘ khóa học "${course?.title || ''}" không?`);
      if (confirmUnlock) {
        const success = unlockFullCoursePoint();
        if (success) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
      return;
    }

    // Studying single lesson awards +1 point
    const todayDate = new Date().toDateString();
    const lastShownDate = localStorage.getItem('shopee_popup_shown_date');

    if (lastShownDate === todayDate) {
      const canProceed = completeLessonPoint(lessonTitle);
      if (canProceed) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setPendingUrl(url);
      setHasClickedShopee(false);
      setShowShopeeModal(true);
    }
  };

  const handleProceedToLink = () => {
    const todayDate = new Date().toDateString();

    // 1. Award +1 point for studying lesson (returns false if >= 5 daily lessons limit)
    const canProceed = completeLessonPoint('Bài học mới');
    if (!canProceed) return;

    // 2. Perform daily check-in automatically for today!
    performDailyCheckinIfNeeded();

    // 3. Save popup shown date
    localStorage.setItem('shopee_popup_shown_date', todayDate);
    setShowShopeeModal(false);

    if (pendingUrl) {
      window.open(pendingUrl, '_blank', 'noopener,noreferrer');
      setPendingUrl(null);
    }
  };

  // Helper to extract JSON tree structure
  const getCourseStructure = (c) => {
    if (!c) return null;
    if (c.structure) {
      return typeof c.structure === 'string'
        ? JSON.parse(c.structure)
        : c.structure;
    }
    if (c.description) {
      let desc = c.description.trim();
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

  const structureTree = getCourseStructure(course);
  const totalLessons = structureTree
    ? countLessonsInNode(structureTree)
    : course && course.items
    ? course.items.length
    : 1;

  const totalChapters = structureTree ? countChaptersInNode(structureTree) : 0;
  const viewCount = course && course.views != null ? course.views : 0;

  return (
    <div className="free-detail-page">
      <Navbar />

      <main className="free-detail-container">
        {/* Back Button */}
        <Link to="/khoa-hoc-free" className="free-back-btn">
          <FaArrowLeft /> Quay lại danh sách khóa học
        </Link>

        {/* Loading State */}
        {loading ? (
          <div className="free-detail-loading">
            <FaSpinner className="free-detail-loading-spinner" />
            <p>Đang tải thông tin khóa học...</p>
          </div>
        ) : error || !course ? (
          <div className="free-empty" style={{ margin: '40px 0' }}>
            <FaInfoCircle className="free-empty-icon" />
            <h3 className="free-empty-title">{error || 'Không tìm thấy khóa học'}</h3>
            <p className="free-empty-desc">
              Khóa học này có thể đã bị xóa hoặc đường dẫn không khả dụng.
            </p>
            <Link to="/khoa-hoc-free" className="free-btn-action-pill" style={{ display: 'inline-flex', marginTop: 16 }}>
              Về Danh Sách Khóa Học
            </Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="free-breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span className="free-breadcrumb-separator">/</span>
              <Link to="/khoa-hoc-free">Khóa Học Free</Link>
              <span className="free-breadcrumb-separator">/</span>
              <span className="free-breadcrumb-current">{course.title}</span>
            </div>

            {/* Header Hero Box */}
            <div className="free-detail-header-card">
              <span className="free-detail-cat-tag">{course.category || 'Tài liệu Miễn phí'}</span>
              <h1 className="free-detail-title">{course.title}</h1>
              
              {(!structureTree && course.description && !course.description.trim().startsWith('{')) && (
                <p className="free-detail-desc-text">{course.description}</p>
              )}

              <div className="free-detail-meta-row">
                <div className="free-detail-meta-item">
                  <FaPlayCircle /> {totalLessons} bài học / tài liệu
                </div>
                {totalChapters > 0 && (
                  <div className="free-detail-meta-item">
                    <FaBookmark /> {totalChapters} chương học
                  </div>
                )}
                <div className="free-detail-meta-item">
                  <FaEye /> {viewCount} lượt xem
                </div>
              </div>

              {/* Main Full Course Activation Card */}
              {isUnlocked ? (
                <div className="unlocked-course-card" style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      <FaBookmark />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, color: '#34d399', fontSize: '1rem' }}>KHÓA HỌC ĐÃ KÍCH HOẠT TRỌN BỘ (-20Đ)</div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: 2 }}>Bạn đã dùng 20 điểm để kích hoạt khóa học này. Tất cả bài học trong khóa đều được xem tự do không giới hạn.</div>
                    </div>
                  </div>
                  {(course.link || course.driveLink) && (
                    <a href={course.link || course.driveLink} target="_blank" rel="noopener noreferrer" style={{ background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: 9999, textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
                      <FaExternalLinkAlt /> Mở Thư Mục Drive Full
                    </a>
                  )}
                </div>
              ) : (
                <div className="unlock-course-card" style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      <FaLock />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, color: '#ffffff', fontSize: '0.98rem' }}>Kích Hoạt Trọn Bộ Khóa Học (Dùng 20 Điểm)</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>Trừ <strong>20 điểm</strong> từ số dư tài khoản để kích hoạt và xem toàn bộ bài học không bị giới hạn 5 bài/ngày.</div>
                    </div>
                  </div>
                  <button
                    className="free-unlock-full-course-btn"
                    onClick={handleConfirmUnlockCourse}
                  >
                    🔓 Kích Hoạt (-20đ)
                  </button>
                </div>
              )}
            </div>

            {/* Main Interactive Tree View Container */}
            <div className="free-detail-tree-card">
              <div className="tree-header-bar">
                <div className="tree-header-title">
                  <FaBookOpen style={{ color: '#38bdf8' }} /> Cấu Trúc Khóa Học & Bài Học Chi Tiết
                </div>
                <span className="tree-badge-count">{totalLessons} bài học</span>
              </div>

              {structureTree ? (
                <div>
                  {structureTree.children && Array.isArray(structureTree.children) ? (
                    structureTree.children.map((node, index) => (
                      <CourseTreeNode key={index} node={node} depth={0} onLessonClick={handleLessonClick} />
                    ))
                  ) : (
                    <CourseTreeNode node={structureTree} depth={0} onLessonClick={handleLessonClick} />
                  )}
                </div>
              ) : (
                /* Fallback Flat Lessons List */
                <div>
                  {course.items && course.items.length > 0 ? (
                    course.items.map((item, index) => (
                      <div key={index} className="tree-node-lesson">
                        <div className="tree-lesson-info">
                          <FaPlayCircle className="tree-lesson-icon" />
                          <span className="tree-lesson-title">{item.title || `Bài học ${index + 1}`}</span>
                        </div>
                        <a
                          href={item.link || course.link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tree-lesson-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLessonClick(item.link || course.link);
                          }}
                        >
                          Học Ngay <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="tree-node-lesson">
                      <div className="tree-lesson-info">
                        <FaPlayCircle className="tree-lesson-icon" />
                        <span className="tree-lesson-title">Trọn bộ Bài giảng & Tài liệu {course.title}</span>
                      </div>
                      <a
                        href={course.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tree-lesson-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLessonClick(course.link);
                        }}
                      >
                        Mở Link Học <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* LOGIN PROMPT POPUP MODAL */}
      <AuthPopupModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccessLogin={() => {
          setShowLoginModal(false);
          if (pendingUrl) {
            const urlToOpen = pendingUrl;
            setTimeout(() => {
              handleLessonClick(urlToOpen);
            }, 200);
          }
        }}
      />

      {/* Shopee Sponsor & Daily Check-in Modal */}
      {showShopeeModal && pendingUrl && (
        <div
          className="free-shopee-overlay"
          onClick={() => {
            if (hasClickedShopee) handleProceedToLink();
          }}
        >
          <div className="free-shopee-box" onClick={(e) => e.stopPropagation()}>
            <button className="shopee-close-x-btn" onClick={() => setShowShopeeModal(false)} title="Đóng">
              <span className="shopee-x-text">✕</span>
            </button>
            <span className="free-shopee-heart">❤️</span>
            <h2 className="free-shopee-title">Điểm Danh Shopee Hàng Ngày Để Học</h2>
            <p className="free-shopee-text">
              Ủng hộ Admin 1 click link Shopee để duy trì kho tài liệu free! Hệ thống sẽ **TỰ ĐỘNG ĐIỂM DANH HÀNG NGÀY**, cộng điểm thưởng chuỗi và mở bài học cho bạn!
            </p>
            <a
              href={SHOPEE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="free-shopee-btn-buy"
              onClick={() => setHasClickedShopee(true)}
            >
              <FaShoppingBag /> Ghé Shopee Ủng Hộ (Điểm Danh)
            </a>
            <button
              className="free-shopee-btn-close"
              disabled={!hasClickedShopee}
              onClick={handleProceedToLink}
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
              {hasClickedShopee ? "✨ Xác Nhận Điểm Danh & Xem Bài Học Ngay" : "🔒 Vui lòng click link Shopee phía trên để điểm danh"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

