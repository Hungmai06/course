import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import freeCourse from '../services/freeCourse';
import Pagination from '../components/Pagination';
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
  FaEye
} from 'react-icons/fa';
import './FreeCourses.css';

// Helper to count lessons recursively
const countLessonsInNode = (node) => {
  if (!node) return 0;
  if (node.type === 'lesson') return 1;
  if (node.children && Array.isArray(node.children)) {
    return node.children.reduce((acc, child) => acc + countLessonsInNode(child), 0);
  }
  return 0;
};

export default function FreeCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchFreeCourses();
  }, []);

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

  const handleCourseClick = (course) => {
    if (course) {
      navigate(`/khoa-hoc-free/${getSlugWithId(course.title, course.id)}`);
    }
  };

  // Build category tabs list dynamically combining presets & actual categories
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

  return (
    <div className="free-courses-page">
      <Navbar />

      <main className="free-dashboard-layout single-column">
        <section className="free-content-area">
          <div>
            {/* Header Title Section */}
            <div className="free-header-section">
              <h1 className="free-main-title">Khóa Học Miễn Phí</h1>
              <p className="free-main-subtitle">
                Nơi chia sẻ các khóa học Free chất lượng cao. Mọi người chịu khó ủng hộ click link Shopee 1 lần mỗi ngày để duy trì hệ thống nha! ❤️<br />
                Nếu bạn nào muốn học nhanh hơn và nhận trọn bộ 1 lần có thể{' '}
                <span className="free-buy-link" onClick={() => navigate('/')}>
                  sang trang Mua Khóa Học (Trang Chủ)
                </span>{' '}
                để tham khảo nhé! ✨
              </p>

              {/* Search Box */}
              <div className="free-search-box">
                <FaSearch className="free-search-icon" />
                <input
                  type="text"
                  className="free-search-input"
                  placeholder="Tìm kiếm bài học, khóa học..."
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
