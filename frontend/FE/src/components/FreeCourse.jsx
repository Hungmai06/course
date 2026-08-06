import React, { useEffect, useState } from 'react';
import freeCourse from '../services/freeCourse';
import freeUserService from '../services/freeUserService';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaRobot, 
  FaCopy, 
  FaChevronDown, 
  FaChevronUp, 
  FaFolderPlus, 
  FaBookOpen, 
  FaFileAlt,
  FaUsers,
  FaHistory,
  FaCoins,
  FaFire,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaAward,
  FaUserCheck,
  FaExchangeAlt
} from 'react-icons/fa';
import Pagination from './Pagination';
import LoadingPlaceholder from './LoadingPlaceholder';
import './CourseModal.css';
import { showToast } from '../utils/toast';

const PRESET_CATEGORIES = [
  'Ngoại ngữ',
  'Lập trình',
  'Kỹ năng mềm',
  'Thiết kế & Công nghệ',
  'Khác'
];

const AI_PROMPT_TEMPLATE = `Bạn là AI chuyên phân tích cấu trúc khóa học.

Đầu vào là danh sách chương, thư mục, bài học hoặc văn bản tự do.

Hãy chuyển đổi thành JSON theo các quy tắc sau:

- Mỗi node gồm:
  - type: "chapter", "folder" hoặc "lesson"
  - title: tên chương/thư mục/bài học
  - url: chỉ có ở lesson (nếu có link)
  - children: mảng các node con (nếu là chapter hoặc folder)

- Hỗ trợ folder lồng nhau không giới hạn.
- Giữ nguyên thứ tự xuất hiện.
- Nếu một bài không có link thì vẫn tạo lesson và bỏ trường url.
- Chỉ trả về JSON hợp lệ, không giải thích, không dùng Markdown.

Ví dụ:

Input:
Chương 1
- Bài 1
https://example.com/1
- Source
  - Demo 1
  https://example.com/demo1

Output:
{
  "title": "Khóa học",
  "children": [
    {
      "type": "chapter",
      "title": "Chương 1",
      "children": [
        {
          "type": "lesson",
          "title": "Bài 1",
          "url": "https://example.com/1"
        },
        {
          "type": "folder",
          "title": "Source",
          "children": [
            {
              "type": "lesson",
              "title": "Demo 1",
              "url": "https://example.com/demo1"
            }
          ]
        }
      ]
    }
  ]
}`;

export default function FreeCourse() {
  // Main Admin Section Tabs: 'courses' | 'users' | 'history'
  const [adminTab, setAdminTab] = useState('courses');

  // ==================== TAB 1: COURSES STATES ====================
  const [freeCourseList, setFreeCourseList] = useState([]);
  const [allCategoriesList, setAllCategoriesList] = useState(PRESET_CATEGORIES);
  const [freePage, setFreePage] = useState(0);
  const [freeSize, setFreeSize] = useState(20);
  const [freeTotalPages, setFreeTotalPages] = useState(1);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [freeModalMode, setFreeModalMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [selectedFreeCourse, setSelectedFreeCourse] = useState(null);
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [freeForm, setFreeForm] = useState({
    title: '',
    category: 'Ngoại ngữ',
    description: '',
    link: ''
  });
  const [loadingFree, setLoadingFree] = useState(false);
  const [freeErrors, setFreeErrors] = useState({});

  // ==================== TAB 2: FREE USERS STATES ====================
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usersPage, setUsersPage] = useState(0);
  const usersSize = 10;
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState(null);
  const [pointsInputValue, setPointsInputValue] = useState(0);
  const [pointsReasonValue, setPointsReasonValue] = useState('');
  const [updatingPoints, setUpdatingPoints] = useState(false);

  // ==================== TAB 3: LOGS & HISTORY STATES ====================
  const [historySubTab, setHistorySubTab] = useState('point'); // 'point' | 'learned'
  const [pointHistoryLogs, setPointHistoryLogs] = useState([]);
  const [learnedHistoryLogs, setLearnedHistoryLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsPage, setLogsPage] = useState(0);
  const logsSize = 15;

  // Fetch Free Courses Data
  const fetchCoursesData = async () => {
    try {
      setLoadingFree(true);
      const res = await freeCourse.getAll();
      let allData = [];
      if (res && res.data) {
        if (Array.isArray(res.data.data)) {
          allData = res.data.data;
        } else if (res.data.data && Array.isArray(res.data.data.content)) {
          allData = res.data.data.content;
        } else if (Array.isArray(res.data)) {
          allData = res.data;
        }
      }
      
      allData.sort((a, b) => (b.id || 0) - (a.id || 0));

      const catSet = new Set(PRESET_CATEGORIES);
      allData.forEach(c => {
        if (c.category && c.category.trim()) catSet.add(c.category.trim());
      });
      setAllCategoriesList(Array.from(catSet));

      const totalElements = allData.length;
      if (totalElements > 0) {
        const totalPages = Math.ceil(totalElements / freeSize);
        const currentPage = Math.min(freePage, Math.max(0, totalPages - 1));
        const startIndex = currentPage * freeSize;
        const endIndex = startIndex + freeSize;
        const currentPageData = allData.slice(startIndex, endIndex);
      
        setFreeCourseList(currentPageData);
        setFreeTotalPages(totalPages || 1);
        if (currentPage !== freePage) {
          setFreePage(currentPage);
        }
      } else {
        setFreeCourseList([]);
        setFreeTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching free courses in Admin:", error);
      setFreeCourseList([]);
      setFreeTotalPages(1);
    } finally {
      setLoadingFree(false);
    }
  };

  // Fetch Free Users Data
  const fetchAdminUsers = async () => {
    try {
      setLoadingAdminUsers(true);
      const res = await freeUserService.getAdminUsers();
      if (res && res.data && res.data.data) {
        setAdminUsers(res.data.data);
      } else if (res && res.data && Array.isArray(res.data)) {
        setAdminUsers(res.data);
      } else {
        setAdminUsers([]);
      }
    } catch (error) {
      console.error("Error fetching admin users for free course:", error);
      setAdminUsers([]);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  // Fetch System Logs
  const fetchAdminLogs = async () => {
    try {
      setLoadingLogs(true);
      const [pointRes, learnedRes] = await Promise.all([
        freeUserService.getAdminPointHistory(),
        freeUserService.getAdminLearnedHistory()
      ]);

      if (pointRes && pointRes.data && pointRes.data.data) {
        setPointHistoryLogs(pointRes.data.data);
      } else if (pointRes && pointRes.data && Array.isArray(pointRes.data)) {
        setPointHistoryLogs(pointRes.data);
      }

      if (learnedRes && learnedRes.data && learnedRes.data.data) {
        setLearnedHistoryLogs(learnedRes.data.data);
      } else if (learnedRes && learnedRes.data && Array.isArray(learnedRes.data)) {
        setLearnedHistoryLogs(learnedRes.data);
      }
    } catch (error) {
      console.error("Error fetching admin logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (adminTab === 'courses') {
      fetchCoursesData();
    } else if (adminTab === 'users') {
      fetchAdminUsers();
    } else if (adminTab === 'history') {
      fetchAdminLogs();
    }
  }, [adminTab, freePage, freeSize]);

  // Handle Free Form changes
  const handleFreeFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categorySelect') {
      if (value === '__CUSTOM_NEW__') {
        setIsCustomCategory(true);
        setCustomCategoryInput('');
        setFreeForm(prev => ({ ...prev, category: '' }));
      } else {
        setIsCustomCategory(false);
        setFreeForm(prev => ({ ...prev, category: value }));
      }
    } else {
      setFreeForm(prev => ({ ...prev, [name]: value }));
    }

    if (freeErrors[name]) {
      setFreeErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCustomCategoryChange = (e) => {
    const val = e.target.value;
    setCustomCategoryInput(val);
    setFreeForm(prev => ({ ...prev, category: val }));
  };

  const handleCopyPrompt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
      showToast('Đã sao chép prompt AI thành công!', 'success');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!freeForm.title.trim()) errors.title = 'Tên khóa học không được để trống';
    if (!freeForm.category.trim()) errors.category = 'Vui lòng chọn hoặc nhập danh mục';
    if (!freeForm.description.trim()) errors.description = 'Cấu trúc JSON AI hoặc mô tả không được để trống';
    setFreeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoadingFree(true);
      const formData = new FormData();
      const data = {
        title: freeForm.title.trim(),
        category: freeForm.category.trim(),
        description: freeForm.description,
        link: freeForm.link || '',
        items: []
      };

      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      if (freeModalMode === 'create') {
        await freeCourse.create(formData);
        showToast('Thêm khóa học miễn phí thành công!', 'success');
      } else if (freeModalMode === 'edit') {
        await freeCourse.update(selectedFreeCourse.id, formData);
        showToast('Cập nhật khóa học miễn phí thành công!', 'success');
      }

      setShowFreeModal(false);
      fetchCoursesData();
      resetForm();
    } catch (error) {
      showToast('Có lỗi xảy ra khi lưu dữ liệu!', 'error');
    } finally {
      setLoadingFree(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học miễn phí này?')) {
      try {
        await freeCourse.remove(id);
        showToast('Xóa thành công!', 'success');
        fetchCoursesData();
      } catch (error) {
        showToast('Có lỗi xảy ra khi xóa!', 'error');
      }
    }
  };

  const resetForm = () => {
    setFreeForm({ title: '', category: 'Ngoại ngữ', description: '', link: '' });
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFreeErrors({});
  };

  const openCreateModal = () => {
    setFreeModalMode('create');
    setSelectedFreeCourse(null);
    resetForm();
    setShowFreeModal(true);
  };

  const openEditModal = (course) => {
    setFreeModalMode('edit');
    setSelectedFreeCourse(course);
    const categoryVal = course.category || 'Ngoại ngữ';
    const isKnown = allCategoriesList.includes(categoryVal);
    setIsCustomCategory(!isKnown);
    setCustomCategoryInput(!isKnown ? categoryVal : '');

    setFreeForm({
      title: course.title || '',
      category: categoryVal,
      description: course.description || '',
      link: course.linkDrive || course.link || ''
    });
    setFreeErrors({});
    setShowFreeModal(true);
  };

  const openViewModal = (course) => {
    setFreeModalMode('view');
    setSelectedFreeCourse(course);
    setFreeForm({
      title: course.title || '',
      category: course.category || 'Ngoại ngữ',
      description: course.description || '',
      link: course.linkDrive || course.link || ''
    });
    setShowFreeModal(true);
  };

  // Open Edit User Points Modal
  const openEditPointsModal = (user) => {
    setSelectedUserForPoints(user);
    setPointsInputValue(user.points || 0);
    setPointsReasonValue('');
    setShowPointsModal(true);
  };

  // Save User Points
  const handleSavePoints = async (e) => {
    e.preventDefault();
    if (!selectedUserForPoints) return;
    try {
      setUpdatingPoints(true);
      await freeUserService.updateUserPoints(
        selectedUserForPoints.userId,
        parseInt(pointsInputValue, 10),
        pointsReasonValue
      );
      showToast(`Đã cập nhật điểm cho học viên ${selectedUserForPoints.username}!`, 'success');
      setShowPointsModal(false);
      fetchAdminUsers();
    } catch (error) {
      showToast('Có lỗi xảy ra khi cập nhật điểm!', 'error');
    } finally {
      setUpdatingPoints(false);
    }
  };

  useEffect(() => {
    setUsersPage(0);
  }, [userSearchQuery]);

  useEffect(() => {
    setLogsPage(0);
  }, [historySubTab]);

  // Filtered & Paged Users
  const filteredUsers = adminUsers.filter(u => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(q))
    );
  });

  const usersTotalPages = Math.ceil(filteredUsers.length / usersSize) || 1;
  const pagedUsers = filteredUsers.slice(usersPage * usersSize, (usersPage + 1) * usersSize);

  // Paged Logs
  const currentLogsList = historySubTab === 'point' ? pointHistoryLogs : learnedHistoryLogs;
  const logsTotalPages = Math.ceil(currentLogsList.length / logsSize) || 1;
  const pagedPointLogs = pointHistoryLogs.slice(logsPage * logsSize, (logsPage + 1) * logsSize);
  const pagedLearnedLogs = learnedHistoryLogs.slice(logsPage * logsSize, (logsPage + 1) * logsSize);

  return (
    <div style={{ padding: 28, background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      {/* Top Banner Navigation matching Admin Design System */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '20px 24px', borderRadius: 20, marginBottom: 24, color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)' }}>
            <FaBookOpen />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.02em' }}>Quản Lý Khóa Học Free & Gamification Học Viên</h3>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Quản lý nội dung khóa học, điểm thưởng Shopee check-in và nhật ký học bài của học viên.</span>
          </div>
        </div>

        {/* Admin Section Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: 4, borderRadius: 9999, border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <button
            onClick={() => setAdminTab('courses')}
            style={{
              padding: '8px 18px',
              borderRadius: 9999,
              border: 'none',
              background: adminTab === 'courses' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
              color: adminTab === 'courses' ? '#ffffff' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: adminTab === 'courses' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            <FaBookOpen /> Tất Cả Khóa Học Free
          </button>
          <button
            onClick={() => setAdminTab('users')}
            style={{
              padding: '8px 18px',
              borderRadius: 9999,
              border: 'none',
              background: adminTab === 'users' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
              color: adminTab === 'users' ? '#ffffff' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: adminTab === 'users' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            <FaUsers /> Học Viên & Điểm Thưởng ({adminUsers.length || 0})
          </button>
          <button
            onClick={() => setAdminTab('history')}
            style={{
              padding: '8px 18px',
              borderRadius: 9999,
              border: 'none',
              background: adminTab === 'history' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
              color: adminTab === 'history' ? '#ffffff' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: adminTab === 'history' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            <FaHistory /> Nhật Ký Hoạt Động
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL FREE COURSES LIST & CRUD                                      */}
      {/* ========================================================================= */}
      {adminTab === 'courses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QUẢN LÝ DỮ LIỆU</span>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>Danh sách Khóa học Free</h2>
            </div>
            
            <button
              onClick={openCreateModal}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 9999,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                letterSpacing: '0.03em'
              }}
            >
              <FaPlus /> THÊM KHÓA HỌC FREE
            </button>
          </div>

          {loadingFree ? (
            <LoadingPlaceholder />
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>STT / ID</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TÊN KHÓA HỌC FREE</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>DANH MỤC</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>CẤU TRÚC AI JSON</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.04em' }}>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {freeCourseList.map((course) => {
                    const categoryVal = course.category || 'Ngoại ngữ';
                    let catBg = '#e2e8f0';
                    let catColor = '#1e293b';
                    let catBorder = '#cbd5e1';

                    if (categoryVal === 'Ngoại ngữ') {
                      catBg = '#dbeafe'; catColor = '#1e40af'; catBorder = '#93c5fd';
                    } else if (categoryVal === 'Lập trình') {
                      catBg = '#f3e8ff'; catColor = '#6b21a8'; catBorder = '#d8b4fe';
                    } else if (categoryVal === 'Kỹ năng mềm') {
                      catBg = '#fef3c7'; catColor = '#92400e'; catBorder = '#fde68a';
                    } else if (categoryVal === 'Thiết kế & Công nghệ') {
                      catBg = '#d1fae5'; catColor = '#065f46'; catBorder = '#6ee7b7';
                    }

                    return (
                      <tr key={course.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#2563eb' }}>#{course.id}</td>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0f172a', fontSize: 15 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                              <FaFileAlt />
                            </div>
                            <span style={{ color: '#0f172a', fontWeight: 800 }}>{course.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: catBg, color: catColor, border: `1px solid ${catBorder}`, padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 800, display: 'inline-block' }}>
                            {categoryVal}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '6px 14px', borderRadius: 8, fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <FaRobot style={{ fontSize: 14 }} /> Cấu trúc AI JSON Hợp lệ
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openViewModal(course)}
                              title="Xem chi tiết"
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '7px 14px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                boxShadow: '0 3px 8px rgba(37, 99, 235, 0.3)'
                              }}
                            >
                              <FaEye /> Xem
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              title="Chỉnh sửa"
                              style={{
                                background: '#d97706',
                                color: '#ffffff',
                                border: 'none',
                                padding: '7px 14px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                boxShadow: '0 3px 8px rgba(217, 119, 6, 0.3)'
                              }}
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              title="Xóa khóa học"
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                padding: '7px 14px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                boxShadow: '0 3px 8px rgba(220, 38, 38, 0.3)'
                              }}
                            >
                              <FaTrash /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              currentPage={freePage + 1}
              totalPages={freeTotalPages}
              onPageChange={page => setFreePage(page - 1)}
            />
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FREE COURSE USERS & GAMIFICATION POINTS                           */}
      {/* ========================================================================= */}
      {adminTab === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HỌC VIÊN TÍCH ĐIỂM</span>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>Danh Sách Học Viên & Điểm Thưởng Gamification</h2>
            </div>

            {/* Search input for users */}
            <div style={{ position: 'relative', minWidth: 280 }}>
              <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tìm học viên theo tên, email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  borderRadius: 9999,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {loadingAdminUsers ? (
            <LoadingPlaceholder />
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#f8fafc', borderRadius: 16 }}>
              Chưa tìm thấy học viên nào.
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>ID</th>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>HỌC VIÊN</th>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>ĐIỂM THƯỞNG</th>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>STREAK ĐIỂM DANH</th>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>ĐIỂM DANH HÔM NAY</th>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>BÀI HỌC HÔM NAY</th>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>GIỚI THIỆU</th>
                      <th style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: 13, textAlign: 'right' }}>HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map((u) => (
                      <tr key={u.userId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#2563eb' }}>#{u.userId}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{u.username}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: 9999, fontWeight: 900, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <FaCoins style={{ color: '#f59e0b' }} /> {u.points != null ? u.points : 0} điểm
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa', padding: '5px 12px', borderRadius: 10, fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FaFire style={{ color: '#f97316' }} /> {u.streakDays || 0} ngày
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {u.isCheckedInToday ? (
                            <span style={{ color: '#15803d', fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <FaCheckCircle /> Đã điểm danh
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <FaTimesCircle /> Chưa điểm danh
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                          {u.dailyLessonsCount || 0}/5 bài
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#475569' }}>
                          <div><strong style={{ color: '#0f172a' }}>{u.referralsCount || 0}</strong> bạn bè</div>
                          {u.referralCode && <code style={{ fontSize: 11, color: '#2563eb' }}>{u.referralCode}</code>}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => openEditPointsModal(u)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '7px 16px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 3px 8px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <FaExchangeAlt /> Cộng / Trừ Điểm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {usersTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                  <Pagination
                    currentPage={usersPage + 1}
                    totalPages={usersTotalPages}
                    onPageChange={page => setUsersPage(page - 1)}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM LOGS & ACTIVITY HISTORY                                     */}
      {/* ========================================================================= */}
      {adminTab === 'history' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NHẬT KÝ HỆ THỐNG</span>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>Lịch Sử Điểm Thưởng & Bài Học Đã Xem</h2>
            </div>

            <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
              <button
                onClick={() => setHistorySubTab('point')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: historySubTab === 'point' ? '#ffffff' : 'transparent',
                  color: historySubTab === 'point' ? '#2563eb' : '#64748b',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: historySubTab === 'point' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Nhật ký tích / trừ điểm ({pointHistoryLogs.length})
              </button>
              <button
                onClick={() => setHistorySubTab('learned')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: historySubTab === 'learned' ? '#ffffff' : 'transparent',
                  color: historySubTab === 'learned' ? '#2563eb' : '#64748b',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: historySubTab === 'learned' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Nhật ký xem bài học ({learnedHistoryLogs.length})
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <LoadingPlaceholder />
          ) : historySubTab === 'point' ? (
            <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>HỌC VIÊN</th>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>NỘI DUNG HOẠT ĐỘNG</th>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>THAY ĐỔI ĐIỂM</th>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>THỜI GIAN</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPointLogs.map((log, idx) => {
                    const isPlus = log.points && log.points.startsWith('+');
                    return (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>{log.username || 'Học viên'}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{log.email || ''}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                          {log.action}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: isPlus ? '#ecfdf5' : '#fef2f2',
                            color: isPlus ? '#047857' : '#b91c1c',
                            border: `1px solid ${isPlus ? '#a7f3d0' : '#fecaca'}`,
                            padding: '4px 12px',
                            borderRadius: 9999,
                            fontWeight: 900,
                            fontSize: 12
                          }}>
                            {log.points}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 12, color: '#64748b' }}>
                          {log.time} - {log.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>HỌC VIÊN</th>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>TÊN KHÓA HỌC</th>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>BÀI HỌC ĐÃ XEM</th>
                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b', fontSize: 13 }}>THỜI GIAN</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedLearnedLogs.map((log, idx) => (
                    <tr key={log.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>{log.username || 'Học viên'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{log.email || ''}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#2563eb', fontSize: 13 }}>
                        {log.courseTitle || 'Khóa học Free'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                        {log.lessonTitle || 'Bài học'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: '#64748b' }}>
                        {log.time} - {log.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {logsTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Pagination
                currentPage={logsPage + 1}
                totalPages={logsTotalPages}
                onPageChange={page => setLogsPage(page - 1)}
              />
            </div>
          )}
        </>
      )}

      {/* MODAL EDIT USER POINTS */}
      {showPointsModal && selectedUserForPoints && (
        <div className="modal-overlay" onClick={() => setShowPointsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, width: '92%' }}>
            <div className="modal-header">
              <h3>Cập Nhật Điểm Cho Học Viên</h3>
              <button className="modal-close" onClick={() => setShowPointsModal(false)}>×</button>
            </div>
            <form onSubmit={handleSavePoints} className="modal-body">
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedUserForPoints.username}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{selectedUserForPoints.email}</div>
                <div style={{ fontSize: 12, color: '#d97706', marginTop: 4, fontWeight: 700 }}>
                  Điểm hiện tại: {selectedUserForPoints.points || 0} điểm
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 700 }}>Số điểm thưởng mới: *</label>
                <input
                  type="number"
                  value={pointsInputValue}
                  onChange={(e) => setPointsInputValue(e.target.value)}
                  className="form-input"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 700 }}>Lý do / Ghi chú điều chỉnh:</label>
                <input
                  type="text"
                  placeholder="VD: Thưởng học viên xuất sắc, Hỗ trợ học viên..."
                  value={pointsReasonValue}
                  onChange={(e) => setPointsReasonValue(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" onClick={() => setShowPointsModal(false)} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary" disabled={updatingPoints}>
                  {updatingPoints ? 'Đang lưu...' : 'Cập Nhật Điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COURSE CREATE / EDIT / VIEW */}
      {showFreeModal && (
        <div className="modal-overlay" onClick={() => setShowFreeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 740, width: '92%' }}>
            <div className="modal-header">
              <h3>
                {freeModalMode === 'create' && 'Thêm khóa học miễn phí mới'}
                {freeModalMode === 'edit' && 'Chỉnh sửa khóa học miễn phí'}
                {freeModalMode === 'view' && 'Chi tiết khóa học miễn phí'}
              </h3>
              <button className="modal-close" onClick={() => setShowFreeModal(false)}>×</button>
            </div>

            <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
              {freeModalMode === 'view' ? (
                <div>
                  <div className="form-group">
                    <label style={{ fontWeight: 600 }}>Tên khóa học:</label>
                    <p style={{ padding: 12, background: '#f9fafb', borderRadius: 8, fontWeight: 700 }}>{freeForm.title}</p>
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: 600 }}>Danh mục:</label>
                    <p style={{ padding: 10, background: '#f9fafb', borderRadius: 8 }}>{freeForm.category}</p>
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: 600 }}>JSON Cấu trúc Khóa Học:</label>
                    <p style={{ padding: 12, background: '#1e293b', color: '#38bdf8', borderRadius: 8, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13 }}>
                      {freeForm.description}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ margin: 0 }}>Danh mục khóa học: *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) setCustomCategoryInput('');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <FaFolderPlus /> {isCustomCategory ? 'Chọn từ danh sách sẵn có' : '+ Tạo danh mục mới'}
                      </button>
                    </div>

                    {!isCustomCategory ? (
                      <select
                        name="categorySelect"
                        value={allCategoriesList.includes(freeForm.category) ? freeForm.category : '__CUSTOM_NEW__'}
                        onChange={handleFreeFormChange}
                        className={`form-input ${freeErrors.category ? 'error' : ''}`}
                      >
                        {allCategoriesList.map((cat, i) => (
                          <option key={i} value={cat}>{cat}</option>
                        ))}
                        <option value="__CUSTOM_NEW__">+ Nhập danh mục mới...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nhập tên danh mục mới (VD: Marketing, TOEIC...)"
                        value={customCategoryInput}
                        onChange={handleCustomCategoryChange}
                        className={`form-input ${freeErrors.category ? 'error' : ''}`}
                        autoFocus
                      />
                    )}
                    {freeErrors.category && <span className="error-text">{freeErrors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label>Tên khóa học: *</label>
                    <input type="text" name="title" value={freeForm.title} onChange={handleFreeFormChange} className={`form-input ${freeErrors.title ? 'error' : ''}`} placeholder="Nhập tên khóa học" />
                    {freeErrors.title && <span className="error-text">{freeErrors.title}</span>}
                  </div>

                  <div className="form-group" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 14, borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#166534', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaRobot style={{ fontSize: 16 }} /> Mẫu Prompt AI Phân Tích Cấu Trúc Khóa Học
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        style={{
                          background: '#16a34a',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <FaCopy /> Sao Chép Prompt AI
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPromptBox(!showPromptBox)}
                      style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 8, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {showPromptBox ? <FaChevronUp /> : <FaChevronDown />}
                      {showPromptBox ? 'Ẩn mẫu câu lệnh Prompt AI' : 'Xem nội dung mẫu câu lệnh Prompt AI'}
                    </button>

                    {showPromptBox && (
                      <textarea
                        readOnly
                        value={AI_PROMPT_TEMPLATE}
                        rows={10}
                        style={{
                          width: '100%',
                          marginTop: 10,
                          padding: 10,
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          fontSize: 12,
                          fontFamily: 'monospace',
                          color: '#334155'
                        }}
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ margin: 0 }}>Cấu trúc JSON Khóa Học (Dán kết quả từ AI vào đây): *</label>
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaRobot /> Chứa tự động Chương, Thư mục & Bài học
                      </span>
                    </div>
                    <textarea
                      name="description"
                      value={freeForm.description}
                      onChange={handleFreeFormChange}
                      className={`form-input ${freeErrors.description ? 'error' : ''}`}
                      rows={8}
                      placeholder={`Dán kết quả JSON do AI tạo vào đây...`}
                      style={{ fontFamily: 'monospace', fontSize: 13 }}
                    />
                    {freeErrors.description && <span className="error-text">{freeErrors.description}</span>}
                  </div>

                  <div className="modal-actions" style={{ marginTop: 24 }}>
                    <button type="button" onClick={() => setShowFreeModal(false)} className="btn-secondary">Hủy</button>
                    <button type="submit" className="btn-primary" disabled={loadingFree}>
                      {loadingFree ? 'Đang lưu...' : 'Lưu khóa học'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
