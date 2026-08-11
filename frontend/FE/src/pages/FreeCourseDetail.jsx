import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import freeCourse from '../services/freeCourse';
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
  FaShoppingBag
} from 'react-icons/fa';
import './FreeCourseDetail.css';

const SHOPEE_LINK = "https://s.shopee.vn/8KmufuFQ2y";

// Helper to get local YYYY-MM-DD date string (resets after 00:00 midnight)
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const hasClickedShopeeToday = () => {
  const lastDate = localStorage.getItem('shopee_last_click_date');
  return lastDate === getTodayDateString();
};

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

  // Shopee Sponsor Modal States
  const [showShopeeModal, setShowShopeeModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [hasClickedShopee, setHasClickedShopee] = useState(false);

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

  // Main lesson click handler with Shopee Sponsor Modal check
  const handleLessonClick = (url) => {
    if (!url || url === '#') return;

    if (hasClickedShopeeToday()) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setPendingUrl(url);
      setHasClickedShopee(false);
      setShowShopeeModal(true);
    }
  };

  const handleOpenShopeeLink = () => {
    localStorage.setItem('shopee_last_click_date', getTodayDateString());
    setHasClickedShopee(true);
  };

  const handleProceedToLink = () => {
    localStorage.setItem('shopee_last_click_date', getTodayDateString());
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

              {(course.link || course.driveLink) && (
                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={() => handleLessonClick(course.link || course.driveLink)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      padding: '12px 24px',
                      borderRadius: 9999,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <FaExternalLinkAlt /> Mở Thư Mục Drive Trọn Bộ
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

      {/* Shopee Sponsor Modal */}
      {showShopeeModal && (
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
            <h2 className="free-shopee-title">Ủng Hộ Shopee Để Vào Học Miễn Phí</h2>
            <p className="free-shopee-text">
              Bạn chỉ cần ủng hộ Admin <strong>1 click link Shopee duy nhất mỗi ngày</strong> (hệ thống sẽ yêu cầu click lại sau 12h đêm) để giữ cho kho khóa học luôn hoàn toàn miễn phí!
            </p>
            <a
              href={SHOPEE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="free-shopee-btn-buy"
              onClick={handleOpenShopeeLink}
            >
              <FaShoppingBag /> Ghé Shopee Ủng Hộ (Mở Link Shopee)
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
              {hasClickedShopee ? "✨ Xác Nhận & Vào Bài Học Ngay" : "🔒 Vui lòng click link Shopee phía trên để mở bài học"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
