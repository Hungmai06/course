import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import LoadingPlaceholder from './LoadingPlaceholder';
import Pagination from './Pagination';

export default function Category() {
  const [categoryModalMode, setCategoryModalMode] = useState('view');
  const [categoryList, setCategoryList] = useState([]);
  const [categoryPage, setCategoryPage] = useState(0);
  const [categorySize, setCategorySize] = useState(20);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [categoryErrors, setCategoryErrors] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(false);

  const normalizeList = (response) => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data?.content)) return payload.data.content;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // Force network fetch on initial load to ensure we see API call
        let res = await categoryService.getAll(true);
        let allData = normalizeList(res);
        
        if (categorySearch) {
          allData = allData.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
        }
        
      
        allData.sort((a, b) => (a.id || 0) - (b.id || 0));
        
      
        const totalPages = Math.ceil(allData.length / categorySize);
        const startIndex = categoryPage * categorySize;
        const endIndex = startIndex + categorySize;
        const currentPageData = allData.slice(startIndex, endIndex);
        
        setCategoryList(currentPageData);
        setCategoryTotalPages(totalPages);
      } catch (err) {
        setCategoryList([]);
        setCategoryTotalPages(1);
      }
    };
    fetchCategory();
  }, [categoryPage, categorySize, categorySearch]);

  const handleCreateCategory = async e => {
    e.preventDefault();
    const errs = {};
    if (!categoryForm.name) errs.name = 'Tên không được để trống';
    if (!categoryForm.description) errs.description = 'Mô tả không được để trống';
    setCategoryErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await categoryService.create({ name: categoryForm.name, description: categoryForm.description });
    categoryService.clearCache();
    setShowCategoryModal(false);
    setCategoryForm({ name: '', description: '' });
    setCategoryErrors({});
    setCategoryPage(0);
    
    // Refresh data với sắp xếp toàn bộ
    const res = await categoryService.getAll();
    let allData = normalizeList(res);
    allData.sort((a, b) => (a.id || 0) - (b.id || 0));
    const totalPages = Math.ceil(allData.length / categorySize);
    const currentPageData = allData.slice(0, categorySize);
    setCategoryList(currentPageData);
    setCategoryTotalPages(totalPages);
  };
  const handleEditCategory = async e => {
    e.preventDefault();
    const errs = {};
    if (!categoryForm.name) errs.name = 'Tên không được để trống';
    if (!categoryForm.description) errs.description = 'Mô tả không được để trống';
    setCategoryErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await categoryService.update(selectedCategory.id, { name: categoryForm.name, description: categoryForm.description });
    categoryService.clearCache();
    setShowCategoryModal(false);
    setCategoryForm({ name: '', description: '' });
    setCategoryErrors({});
    const res = await categoryService.getAll();
    let dataArr = normalizeList(res);
    
    if (dataArr && dataArr.length > 0) {
      dataArr.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idA - idB;
      });
    }
    setCategoryList(dataArr.slice(categoryPage * categorySize, (categoryPage + 1) * categorySize));
    setCategoryTotalPages(Math.ceil(dataArr.length / categorySize));
  };
  const handleDeleteCategory = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa category này?')) return;
    await categoryService.remove(id);
    categoryService.clearCache();
    const res = await categoryService.getAll();
    let dataArr = normalizeList(res);
   
    if (dataArr && dataArr.length > 0) {
      dataArr.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idA - idB;
      });
    }
    setCategoryList(dataArr.slice(categoryPage * categorySize, (categoryPage + 1) * categorySize));
    setCategoryTotalPages(Math.ceil(dataArr.length / categorySize));
  };

  return (
    <div className="section-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Danh mục khóa học</h2>
        <button
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => {
            setCategoryForm({ name: '', description: '' });
            setCategoryErrors({});
            setCategoryModalMode('create');
            setShowCategoryModal(true);
          }}
        >
          <FaPlus /> Tạo mới
        </button>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Tìm kiếm tên danh mục..."
          value={categorySearch}
          onChange={e => { setCategorySearch(e.target.value); setCategoryPage(0); }}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: 240 }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f4ff' }}>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Tên danh mục</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Mô tả</th>
            <th style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categoryList.map((cat, idx) => (
            <tr key={cat.id || idx}>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{cat.id}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{cat.name}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{cat.description}</td>
              <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Xem"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCategoryForm({ name: cat.name, description: cat.description });
                    setCategoryModalMode('view');
                    setShowCategoryModal(true);
                  }}><FaEye /></button>
                <button style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Sửa"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCategoryForm({ name: cat.name, description: cat.description });
                    setCategoryModalMode('edit');
                    setShowCategoryModal(true);
                  }}><FaEdit /></button>
                <button style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: 18, cursor: 'pointer' }} title="Xóa"
                  onClick={() => handleDeleteCategory(cat.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
        <Pagination
          currentPage={categoryPage + 1}
          totalPages={categoryTotalPages}
          onPageChange={page => setCategoryPage(page - 1)}
        />
      </div>
      {showCategoryModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, minHeight: 200, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowCategoryModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            {loadingCategory ? (
              <LoadingPlaceholder count={1} height={120} />
            ) : categoryModalMode === 'view' && selectedCategory ? (
              <div>
                <h3>Thông tin danh mục</h3>
                <div><b>ID:</b> {selectedCategory.id}</div>
                <div><b>Tên:</b> {selectedCategory.name}</div>
                <div><b>Mô tả:</b> {selectedCategory.description}</div>
              </div>
            ) : categoryModalMode === 'edit' && selectedCategory ? (
              <form onSubmit={handleEditCategory} style={{ minWidth: 320 }}>
                <h3>Cập nhật danh mục</h3>
                <div style={{ marginBottom: 16 }}>
                  <label>Tên danh mục:</label>
                  <input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {categoryErrors.name && <div style={{ color: 'red', fontSize: 13 }}>{categoryErrors.name}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Mô tả:</label>
                  <textarea value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }} />
                  {categoryErrors.description && <div style={{ color: 'red', fontSize: 13 }}>{categoryErrors.description}</div>}
                </div>
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu</button>
              </form>
            ) : categoryModalMode === 'create' ? (
              <form onSubmit={handleCreateCategory} style={{ minWidth: 320 }}>
                <h3>Tạo danh mục mới</h3>
                <div style={{ marginBottom: 16 }}>
                  <label>Tên danh mục:</label>
                  <input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {categoryErrors.name && <div style={{ color: 'red', fontSize: 13 }}>{categoryErrors.name}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Mô tả:</label>
                  <textarea value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }} />
                  {categoryErrors.description && <div style={{ color: 'red', fontSize: 13 }}>{categoryErrors.description}</div>}
                </div>
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Tạo mới</button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
