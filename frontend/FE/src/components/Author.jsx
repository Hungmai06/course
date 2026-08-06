import React, { useEffect, useState } from 'react';
import authorService from '../services/authorService';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function Author() {
  const [authorModalMode, setAuthorModalMode] = useState('view');
  const [authorList, setAuthorList] = useState([]);
  const [authorPage, setAuthorPage] = useState(0);
  const [authorSize, setAuthorSize] = useState(20);
  const [authorTotalPages, setAuthorTotalPages] = useState(1);
  const [authorSearch, setAuthorSearch] = useState('');
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorForm, setAuthorForm] = useState({ name: '', description: '' });
  const [authorErrors, setAuthorErrors] = useState({});
  const [loadingAuthor, setLoadingAuthor] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        let res = await authorService.getAll();
        let allData = res.data.data;
        
        if (authorSearch) {
          allData = allData.filter(a => a.name.toLowerCase().includes(authorSearch.toLowerCase()));
        }
        
        allData.sort((a, b) => (a.id || 0) - (b.id || 0));
        
        const totalPages = Math.ceil(allData.length / authorSize);
        const startIndex = authorPage * authorSize;
        const endIndex = startIndex + authorSize;
        const currentPageData = allData.slice(startIndex, endIndex);
        
        setAuthorList(currentPageData);
        setAuthorTotalPages(totalPages);
      } catch (err) {
        setAuthorList([]);
        setAuthorTotalPages(1);
      }
    };
    fetchAuthor();
  }, [authorPage, authorSize, authorSearch]);

  const handleCreateAuthor = async e => {
    e.preventDefault();
    const errs = {};
    if (!authorForm.name) errs.name = 'Tên không được để trống';
    if (!authorForm.description) errs.description = 'Mô tả không được để trống';
    setAuthorErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await authorService.create({ name: authorForm.name, description: authorForm.description });
    setShowAuthorModal(false);
    setAuthorForm({ name: '', description: '' });
    setAuthorErrors({});
    setAuthorPage(0);
    const res = await authorService.getAll();
    let dataArr = res.data.data;
   
    if (dataArr && dataArr.length > 0) {
      dataArr.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idA - idB;
      });
    }
    setAuthorList(dataArr.slice(0, authorSize));
    setAuthorTotalPages(Math.ceil(dataArr.length / authorSize));
  };
  const handleEditAuthor = async e => {
    e.preventDefault();
    const errs = {};
    if (!authorForm.name) errs.name = 'Tên không được để trống';
    if (!authorForm.description) errs.description = 'Mô tả không được để trống';
    setAuthorErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await authorService.update(selectedAuthor.id, { name: authorForm.name, description: authorForm.description });
    setShowAuthorModal(false);
    setAuthorForm({ name: '', description: '' });
    setAuthorErrors({});
    const res = await authorService.getAll();
    let dataArr = res.data.data;
   
    if (dataArr && dataArr.length > 0) {
      dataArr.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idA - idB;
      });
    }
    setAuthorList(dataArr.slice(authorPage * authorSize, (authorPage + 1) * authorSize));
    setAuthorTotalPages(Math.ceil(dataArr.length / authorSize));
  };
  const handleDeleteAuthor = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa tác giả này?')) return;
    await authorService.remove(id);
    const res = await authorService.getAll();
    let dataArr = res.data.data;
   
    if (dataArr && dataArr.length > 0) {
      dataArr.sort((a, b) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idA - idB;
      });
    }
    setAuthorList(dataArr.slice(authorPage * authorSize, (authorPage + 1) * authorSize));
    setAuthorTotalPages(Math.ceil(dataArr.length / authorSize));
  };

  return (
    <div className="section-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Danh sách tác giả</h2>
        <button
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => {
            setAuthorForm({ name: '', description: '' });
            setAuthorErrors({});
            setAuthorModalMode('create');
            setShowAuthorModal(true);
          }}
        >
          <FaPlus /> Tạo mới
        </button>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Tìm kiếm tên tác giả..."
          value={authorSearch}
          onChange={e => { setAuthorSearch(e.target.value); setAuthorPage(0); }}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: 240 }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f4ff' }}>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Tên tác giả</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Mô tả</th>
            <th style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {authorList.map((author, idx) => (
            <tr key={author.id || idx}>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{author.id}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{author.name}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{author.description}</td>
              <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Xem"
                  onClick={() => {
                    setSelectedAuthor(author);
                    setAuthorForm({ name: author.name, description: author.description });
                    setAuthorModalMode('view');
                    setShowAuthorModal(true);
                  }}><FaEye /></button>
                <button style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Sửa"
                  onClick={() => {
                    setSelectedAuthor(author);
                    setAuthorForm({ name: author.name, description: author.description });
                    setAuthorModalMode('edit');
                    setShowAuthorModal(true);
                  }}><FaEdit /></button>
                <button style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: 18, cursor: 'pointer' }} title="Xóa"
                  onClick={() => handleDeleteAuthor(author.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
        <Pagination
          currentPage={authorPage + 1}
          totalPages={authorTotalPages}
          onPageChange={page => setAuthorPage(page - 1)}
        />
      </div>
      {showAuthorModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, minHeight: 200, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowAuthorModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            {loadingAuthor ? (
              <LoadingPlaceholder count={1} height={120} />
            ) : authorModalMode === 'view' && selectedAuthor ? (
              <div>
                <h3>Thông tin tác giả</h3>
                <div><b>ID:</b> {selectedAuthor.id}</div>
                <div><b>Tên:</b> {selectedAuthor.name}</div>
                <div><b>Mô tả:</b> {selectedAuthor.description}</div>
              </div>
            ) : authorModalMode === 'edit' && selectedAuthor ? (
              <form onSubmit={handleEditAuthor} style={{ minWidth: 320 }}>
                <h3>Cập nhật tác giả</h3>
                <div style={{ marginBottom: 16 }}>
                  <label>Tên tác giả:</label>
                  <input value={authorForm.name} onChange={e => setAuthorForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {authorErrors.name && <div style={{ color: 'red', fontSize: 13 }}>{authorErrors.name}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Mô tả:</label>
                  <textarea value={authorForm.description} onChange={e => setAuthorForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }} />
                  {authorErrors.description && <div style={{ color: 'red', fontSize: 13 }}>{authorErrors.description}</div>}
                </div>
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu</button>
              </form>
            ) : authorModalMode === 'create' ? (
              <form onSubmit={handleCreateAuthor} style={{ minWidth: 320 }}>
                <h3>Tạo tác giả mới</h3>
                <div style={{ marginBottom: 16 }}>
                  <label>Tên tác giả:</label>
                  <input value={authorForm.name} onChange={e => setAuthorForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {authorErrors.name && <div style={{ color: 'red', fontSize: 13 }}>{authorErrors.name}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Mô tả:</label>
                  <textarea value={authorForm.description} onChange={e => setAuthorForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }} />
                  {authorErrors.description && <div style={{ color: 'red', fontSize: 13 }}>{authorErrors.description}</div>}
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
