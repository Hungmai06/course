import React, { useEffect, useState, useRef } from 'react';
import courseService from '../services/courseService';
import authorService from '../services/authorService';
import { categoryService } from '../services/categoryService';
import { slugify } from '../utils/slugify';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Select, Button } from 'antd';
import LoadingPlaceholder from './LoadingPlaceholder';
import Pagination from './Pagination';
import { showToast } from '../utils/toast';
import './CourseModal.css';

export default function Course() {
  const navigate = useNavigate();
  const [courseList, setCourseList] = useState([]);
  const [coursePage, setCoursePage] = useState(0);
  const [courseSize, setCourseSize] = useState(20);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseModalMode, setCourseModalMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    oldPrice: '',
    newPrice: '',
    linkDrive: '',
    linkTest: '',
    authorId: '',
    categoryId: '',
    file: null,
    slug: ''
  });
  const [createForm] = Form.useForm();

  // description is now a simple string
  const [authorList, setAuthorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  // Fetch author and category list when modal opens
  useEffect(() => {
    if (showCourseModal) {
      authorService.getAll().then(res => {
        setAuthorList(normalizeList(res));
      });
      categoryService.getAll().then(res => {
        setCategoryList(normalizeList(res));
      });
    }
  }, [showCourseModal]);
  const [courseErrors, setCourseErrors] = useState({});
  const [loadingCourse, setLoadingCourse] = useState(false);
  const fileInputRef = useRef();

  const normalizeList = (response) => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data?.content)) return payload.data.content;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const getTotalPages = (response) => {
    const payload = response?.data;
    return payload?.data?.totalPages ?? payload?.totalPages ?? 1;
  };

  const getAuthorId = (course = {}) =>
    course.authorId ??
    course.authorID ??
    course.idAuthor ??
    course.author?.id ??
    course.author?.authorId ??
    '';

  const getCategoryId = (course = {}) =>
    course.categoryId ??
    course.categoryID ??
    course.idCategory ??
    course.category?.id ??
    course.category?.categoryId ??
    '';

  const getAuthorName = (course = {}) =>
    course.nameAuthor ??
    course.authorName ??
    course.author?.name ??
    course.author?.fullName ??
    course.author?.username ??
    '';

  const getCategoryName = (course = {}) =>
    course.nameCategory ??
    course.categoryName ??
    course.category?.name ??
    course.category?.title ??
    '';

  const DISPLAY_AUTHOR_PLACEHOLDER = '__current_author__';
  const DISPLAY_CATEGORY_PLACEHOLDER = '__current_category__';

  const computeDisplayAuthorValue = (course) => {
    const id = getAuthorId(course);
    if (id) return String(id);
    const name = getAuthorName(course);
    if (name) return DISPLAY_AUTHOR_PLACEHOLDER;
    return '';
  };

  const computeDisplayCategoryValue = (course) => {
    const id = getCategoryId(course);
    if (id) return String(id);
    const name = getCategoryName(course);
    if (name) return DISPLAY_CATEGORY_PLACEHOLDER;
    return '';
  };

  const currentEditAuthorId = selectedCourse ? (courseForm.authorId || computeDisplayAuthorValue(selectedCourse) || '') : '';
  const currentEditCategoryId = selectedCourse ? (courseForm.categoryId || computeDisplayCategoryValue(selectedCourse) || '') : '';

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        let res;
        if (courseSearch) {
          res = await courseService.searchCourse({ keyword: courseSearch, page: coursePage, size: courseSize });
        } else {
          res = await courseService.getAll(coursePage, courseSize);
        }
        const allData = normalizeList(res);
        setCourseList(allData);
        setCourseTotalPages(getTotalPages(res));
      } catch (err) {
        setCourseList([]);
        setCourseTotalPages(1);
      }
    };
    fetchCourse();
  }, [coursePage, courseSize, courseSearch]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setCourseForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setCourseForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoadingCourse(true);
    setCourseErrors({});
    try {
      const formData = new FormData();
      if (courseForm.file) formData.append('file', courseForm.file);

      const authorObj = authorList.find(a => a.id == courseForm.authorId);
      const categoryObj = categoryList.find(c => c.id == courseForm.categoryId);
      const data = {
        name: courseForm.name,
        description: courseForm.description,
        oldPrice: courseForm.oldPrice,
        newPrice: courseForm.newPrice,
        linkDrive: courseForm.linkDrive,
        linkTest: courseForm.linkTest,
        authorId: courseForm.authorId,
        categoryId: courseForm.categoryId,
        authorName: authorObj ? (authorObj.name || authorObj.fullName || authorObj.username || authorObj.id) : '',
        categoryName: categoryObj ? (categoryObj.name || categoryObj.title || categoryObj.id) : ''
      };

      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      await courseService.create(formData);

      courseService.clearCache();
      setShowCourseModal(false);
      setCourseForm({
        name: '',
        description: '',
        oldPrice: '',
        newPrice: '',
        linkDrive: '',
        linkTest: '',
        authorId: '',
        categoryId: '',
        file: null
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refreshCourseList();
    } catch (err) {
      setCourseErrors({ submit: 'Lỗi khi tạo khóa học' });
    } finally {
      setLoadingCourse(false);
    }
  };

  // Handler when using AntD Form to create
  const handleCreateForm = async (values) => {
    setLoadingCourse(true);
    setCourseErrors({});
    try {
      const formData = new FormData();
      if (courseForm.file) formData.append('file', courseForm.file);

      const authorId = values.authorId || courseForm.authorId || '';
      const categoryId = values.categoryId || courseForm.categoryId || '';
      const authorObj = authorList.find(a => a.id == authorId);
      const categoryObj = categoryList.find(c => c.id == categoryId);
      const data = {
        name: values.name,
        description: values.description,
        oldPrice: values.oldPrice,
        newPrice: values.newPrice,
        linkDrive: values.linkDrive,
        linkTest: values.linkTest,
        authorId,
        categoryId,
        authorName: authorObj ? (authorObj.name || authorObj.fullName || authorObj.username || authorObj.id) : '',
        categoryName: categoryObj ? (categoryObj.name || categoryObj.title || categoryObj.id) : '',
        slug: values.slug || ''
      };

      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      await courseService.create(formData);

      courseService.clearCache();
      setShowCourseModal(false);
      setCourseForm({ name: '', description: '', oldPrice: '', newPrice: '', linkDrive: '', linkTest: '', authorId: '', categoryId: '', file: null, slug: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refreshCourseList();
    } catch (err) {
      setCourseErrors({ submit: 'Lỗi khi tạo khóa học' });
    } finally {
      setLoadingCourse(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoadingCourse(true);
    setCourseErrors({});
    try {
      const formData = new FormData();

      // Ensure the multipart request always contains a 'file' part.
      // If user didn't choose a new file, send an empty file part so backend won't reject the request.
      if (courseForm.file) {
        formData.append('file', courseForm.file);
      } else {
        formData.append('file', new Blob([], { type: 'application/octet-stream' }), '');
      }

      const authorId = courseForm.authorId || getAuthorId(selectedCourse);
      const categoryId = courseForm.categoryId || getCategoryId(selectedCourse);
      const authorObj = authorList.find(a => a.id == authorId);
      const categoryObj = categoryList.find(c => c.id == categoryId);
      const authorName = authorObj
        ? (authorObj.name || authorObj.fullName || authorObj.username || authorObj.id)
        : (getAuthorName(selectedCourse) || courseForm.nameAuthor || '');
      const categoryName = categoryObj
        ? (categoryObj.name || categoryObj.title || categoryObj.id)
        : (getCategoryName(selectedCourse) || courseForm.nameCategory || '');
      const data = {
        name: courseForm.name,
        description: courseForm.description,
        oldPrice: courseForm.oldPrice,
        newPrice: courseForm.newPrice,
        linkDrive: courseForm.linkDrive,
        linkTest: courseForm.linkTest,
        authorId,
        categoryId,
        authorName,
        categoryName,
        slug: courseForm.slug || ''
      };
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      await courseService.update(selectedCourse.id, formData);
      courseService.clearCache();
      setShowCourseModal(false);
      setSelectedCourse(null);
      setCourseForm({
        name: '', description: '', oldPrice: '', newPrice: '', linkDrive: '', linkTest: '', authorId: '', categoryId: '', file: null, slug: ''
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refreshCourseList();
    } catch (err) {
      setCourseErrors({ submit: 'Lỗi khi cập nhật khóa học' });
    } finally {
      setLoadingCourse(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    setLoadingCourse(true);
    try {
      await courseService.remove(id);
      courseService.clearCache();
      await refreshCourseList();
    } catch (err) {
      showToast('Lỗi khi xóa khóa học', 'error');
    } finally {
      setLoadingCourse(false);
    }
  };

  const refreshCourseList = async () => {

    const res = await courseService.getAll(0, 1000);
    let allData = normalizeList(res);
   
    if (courseSearch) {
      allData = allData.filter(course => 
        course.name?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.authorName?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.categoryName?.toLowerCase().includes(courseSearch.toLowerCase())
      );
    }
   
    // show newest first
    allData.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    const totalPages = Math.ceil(allData.length / courseSize);
    const startIndex = coursePage * courseSize;
    const endIndex = startIndex + courseSize;
    const currentPageData = allData.slice(startIndex, endIndex);
    
    setCourseList(currentPageData);
    setCourseTotalPages(totalPages);
  };

  const handleSyncSlugs = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đồng bộ hóa toàn bộ slug cho các khóa học?')) return;
    setLoadingCourse(true);
    try {
      const res = await courseService.syncSlugs();
      showToast(res.data?.message || 'Đồng bộ slug thành công!', 'success');
      courseService.clearCache();
      await refreshCourseList();
    } catch (err) {
      showToast('Lỗi khi đồng bộ slug', 'error');
    } finally {
      setLoadingCourse(false);
    }
  };

  return (
    <div className="section-table-container" style={{ width: '75%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Danh sách khóa học</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={handleSyncSlugs} 
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          >
            🔄 Đồng bộ Slug
          </button>
          <button onClick={() => { setShowCourseModal(true); setCourseModalMode('create'); setCourseForm({ name: '', description: '', oldPrice: '', newPrice: '', linkDrive: '', linkTest: '', authorId: '', categoryId: '', file: null, slug: '' }); try { createForm.resetFields(); } catch (e) {} if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}><FaPlus /> Thêm mới</button>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Tìm kiếm tên khóa học, tác giả, danh mục..."
          value={courseSearch}
          onChange={e => { setCourseSearch(e.target.value); setCoursePage(0); }}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: 300 }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f4ff' }}>
            <th style={{ padding: '8px', border: '1px solid #eee', width: '80px' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Tên</th>
           
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Giá cũ</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Giá mới</th>
      
            <th style={{ padding: '8px', border: '1px solid #eee', minWidth: 100, maxWidth: 120 }}>Author</th>
            <th style={{ padding: '8px', border: '1px solid #eee', minWidth: 100, maxWidth: 120 }}>Category</th>
            <th style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center', width: '120px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {courseList.map((course, idx) => (
            <tr key={course.id || idx}>
              <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center', fontWeight: 500, color: '#6b7280' }}>{course.id}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{course.name}</td>

              <td style={{ padding: '8px', border: '1px solid #eee' }}>{course.oldPrice}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{course.newPrice}</td>

              <td style={{ padding: '8px', border: '1px solid #eee', minWidth: 100, maxWidth: 120 }}>{course.nameAuthor}</td>
              <td style={{ padding: '8px', border: '1px solid #eee', minWidth: 100, maxWidth: 120 }}>{course.nameCategory}</td>
              <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Xem"
                  onClick={() => {
                      const slug = course.slug || slugify(course.name || course.title || '');
                      navigate(`/course/${slug}`, { state: { courseData: course } });
                    }}><FaEye /></button>
                <button style={{ background: 'none', border: 'none', color: '#f59e42', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Sửa"
                    onClick={() => {
                          setSelectedCourse(course);
                          setCourseForm({
                            ...course,
                            authorId: String(getAuthorId(course) || ''),
                            categoryId: String(getCategoryId(course) || ''),
                            description: Array.isArray(course.description)
                              ? course.description.map(s => s.content || '').join('\n')
                              : (course.description || ''),
                            file: null,
                            slug: course.slug || ''
                          });
                          setCourseModalMode('edit');
                          setShowCourseModal(true);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}><FaEdit /></button>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 18, cursor: 'pointer' }} title="Xóa"
                  onClick={() => handleDelete(course.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
        <Pagination
          currentPage={coursePage + 1}
          totalPages={courseTotalPages}
          onPageChange={page => setCoursePage(page - 1)}
        />
      </div>
      {showCourseModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, maxWidth: 520, width: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowCourseModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            {loadingCourse ? (
              <LoadingPlaceholder count={1} height={120} />
            ) : courseModalMode === 'create' ? (
              <div>
                <h3>Thêm khóa học mới</h3>
                <Form
                  form={createForm}
                  layout="vertical"
                  onFinish={handleCreateForm}
                  onValuesChange={(_, allValues) => setCourseForm(prev => ({ ...prev, ...allValues }))}
                >
                  <Form.Item label="Tên khóa học" name="name" rules={[{ required: true, message: 'Nhập tên khóa học' }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Nhập mô tả' }]}>
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Form.Item label="Giá cũ" name="oldPrice" rules={[{ required: true }]}>
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item label="Giá mới" name="newPrice" rules={[{ required: true }]}>
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item label="Link Drive" name="linkDrive">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Link Test" name="linkTest">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Tác giả" name="authorId" rules={[{ required: true, message: 'Chọn tác giả' }]}>
                    <Select showSearch allowClear placeholder="-- Chọn tác giả --" optionFilterProp="children" onChange={(value) => setCourseForm(prev => ({ ...prev, authorId: value ? String(value) : '' }))}>
                      {authorList.map(a => (<Select.Option key={a.id} value={String(a.id)}>{a.name || a.fullName || a.username || a.id}</Select.Option>))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                    <Select showSearch allowClear placeholder="-- Chọn danh mục --" optionFilterProp="children" onChange={(value) => setCourseForm(prev => ({ ...prev, categoryId: value ? String(value) : '' }))}>
                      {categoryList.map(c => (<Select.Option key={c.id} value={String(c.id)}>{c.name || c.title || c.id}</Select.Option>))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Đường dẫn slug (để trống tự sinh)" name="slug">
                    <Input placeholder="ví dụ: khoa-hoc-moi" />
                  </Form.Item>
                  <Form.Item label="Ảnh (file)">
                    <input name="file" type="file" accept="image/*" onChange={handleInputChange} ref={fileInputRef} />
                  </Form.Item>
                  {courseErrors.submit && <div style={{ color: 'red', marginBottom: 8 }}>{courseErrors.submit}</div>}
                  <Form.Item>
                    <Button type="primary" htmlType="submit">Tạo mới</Button>
                  </Form.Item>
                </Form>
              </div>
            ) : courseModalMode === 'edit' && selectedCourse ? (
              <form onSubmit={handleEdit} className="course-modal-form">
                <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#6366f1' }}>Cập nhật khóa học</h2>
                <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600 }}>Tên khóa học</label>
                    <input name="name" value={courseForm.name} onChange={handleInputChange} required style={{ width: '100%', marginBottom: 12 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600 }}>Tác giả</label>
                    <Select
                      showSearch
                      allowClear
                      placeholder="-- Chọn tác giả --"
                      value={currentEditAuthorId || undefined}
                      optionFilterProp="children"
                      onChange={(value) => setCourseForm(prev => ({ ...prev, authorId: value === DISPLAY_AUTHOR_PLACEHOLDER ? '' : (value || '') }))}
                      style={{ width: '100%', marginBottom: 12 }}
                    >
                      {(currentEditAuthorId === DISPLAY_AUTHOR_PLACEHOLDER || (currentEditAuthorId && !authorList.some(a => String(a.id) === currentEditAuthorId))) && (
                        <Select.Option value={currentEditAuthorId === DISPLAY_AUTHOR_PLACEHOLDER ? DISPLAY_AUTHOR_PLACEHOLDER : currentEditAuthorId}>
                          {getAuthorName(selectedCourse) || currentEditAuthorId}
                        </Select.Option>
                      )}
                      {authorList.map(a => (
                        <Select.Option key={a.id} value={String(a.id)}>{a.name || a.fullName || a.username || a.id}</Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontWeight: 600 }}>Mô tả</label>
                  <textarea name="description" value={courseForm.description} onChange={handleInputChange} rows={6} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600 }}>Giá cũ</label>
                    <input name="oldPrice" value={courseForm.oldPrice} onChange={handleInputChange} type="number" required style={{ width: '100%', marginBottom: 12 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600 }}>Giá mới</label>
                    <input name="newPrice" value={courseForm.newPrice} onChange={handleInputChange} type="number" required style={{ width: '100%', marginBottom: 12 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600 }}>Danh mục</label>
                    <Select
                      showSearch
                      allowClear
                      placeholder="-- Chọn danh mục --"
                      value={currentEditCategoryId || undefined}
                      optionFilterProp="children"
                      onChange={(value) => setCourseForm(prev => ({ ...prev, categoryId: value === DISPLAY_CATEGORY_PLACEHOLDER ? '' : (value || '') }))}
                      style={{ width: '100%', marginBottom: 12 }}
                    >
                      {(currentEditCategoryId === DISPLAY_CATEGORY_PLACEHOLDER || (currentEditCategoryId && !categoryList.some(c => String(c.id) === currentEditCategoryId))) && (
                        <Select.Option value={currentEditCategoryId === DISPLAY_CATEGORY_PLACEHOLDER ? DISPLAY_CATEGORY_PLACEHOLDER : currentEditCategoryId}>
                          {getCategoryName(selectedCourse) || currentEditCategoryId}
                        </Select.Option>
                      )}
                      {categoryList.map(c => (
                        <Select.Option key={c.id} value={String(c.id)}>{c.name || c.title || c.id}</Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 600 }}>Link Drive</label>
                    <input name="linkDrive" value={courseForm.linkDrive} onChange={handleInputChange} style={{ width: '100%', marginBottom: 12 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, marginBottom: 6, color: '#374151' }}>Link Test</label>
                    <input 
                      name="linkTest"
                      value={courseForm.linkTest}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        marginBottom: 0,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 15,
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                      onBlur={e => e.target.style.border = '1px solid #d1d5db'}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, marginBottom: 6, color: '#374151' }}>Ảnh (file)</label>
                    <input 
                      name="file"
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      ref={fileInputRef}
                      style={{
                        width: '100%',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        padding: '7px 8px',
                        fontSize: 15,
                        background: '#f9fafb',
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                      onBlur={e => e.target.style.border = '1px solid #d1d5db'}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, marginBottom: 6, color: '#374151' }}>Slug (đường dẫn rút gọn)</label>
                    <input 
                      name="slug"
                      value={courseForm.slug}
                      onChange={handleInputChange}
                      placeholder="ví dụ: khoa-hoc-tieng-anh"
                      style={{
                        width: '100%',
                        marginBottom: 0,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 15,
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                      onBlur={e => e.target.style.border = '1px solid #d1d5db'}
                    />
                  </div>
                </div>
                {courseErrors.submit && <div style={{ color: 'red', marginBottom: 8 }}>{courseErrors.submit}</div>}
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 17, cursor: 'pointer', margin: '0 auto', display: 'block' }}>Cập nhật</button>
              </form>
            ) : courseModalMode === 'view' && selectedCourse ? (
              <div>
                <h3>Thông tin khóa học</h3>
                <div><b>Tên:</b> {selectedCourse.name}</div>
                <div><b>Mô tả:</b> {selectedCourse.description}</div>
                <div><b>Giá cũ:</b> {selectedCourse.oldPrice}</div>
                <div><b>Giá mới:</b> {selectedCourse.newPrice}</div>
                <div><b>Link Drive:</b> {selectedCourse.linkDrive}</div>
                <div><b>Link Test:</b> {selectedCourse.linkTest}</div>
                <div><b>AuthorName:</b> {selectedCourse.nameAuthor}</div>
                <div><b>CategoryName:</b> {selectedCourse.nameCategory}</div>
            
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
