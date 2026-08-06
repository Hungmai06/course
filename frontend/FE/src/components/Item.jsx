import React, { useEffect, useState } from 'react';
import { itemService } from '../services/itemService';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import LoadingPlaceholder from './LoadingPlaceholder';
import Pagination from './Pagination';

export default function Item() {
    const [itemModalMode, setItemModalMode] = useState('view');
    const [itemList, setItemList] = useState([]);
    const [itemPage, setItemPage] = useState(0);
    const [itemSize, setItemSize] = useState(20);
    const [itemTotalPages, setItemTotalPages] = useState(1);
    const [itemSearch, setItemSearch] = useState('');
    const [showItemModal, setShowItemModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [itemForm, setItemForm] = useState({ itemName: '' });
    const [itemErrors, setItemErrors] = useState({});
    const [loadingItem, setLoadingItem] = useState(false);

    // Trigger to re-fetch data
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchItem = async () => {
        try {
            setLoadingItem(true);
            let res = await itemService.getAll();
            let allData = res.data.data || res.data;

            if (Array.isArray(allData)) {
                if (itemSearch) {
                    allData = allData.filter(c => {
                        const nameVal = c.itemName || c.name || '';
                        return nameVal.toLowerCase().includes(itemSearch.toLowerCase());
                    });
                }

                allData.sort((a, b) => (a.id || 0) - (b.id || 0));

                const totalPages = Math.ceil(allData.length / itemSize);
                const startIndex = itemPage * itemSize;
                const endIndex = startIndex + itemSize;
                const currentPageData = allData.slice(startIndex, endIndex);

                setItemList(currentPageData);
                setItemTotalPages(totalPages);
            } else {
                setItemList([]);
                setItemTotalPages(1);
            }
        } catch (err) {
            setItemList([]);
            setItemTotalPages(1);
        } finally {
            setLoadingItem(false);
        }
    };

    // Depend on refreshKey to re-fetch
    useEffect(() => {
        fetchItem();
    }, [itemPage, itemSize, itemSearch, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleCreateItem = async e => {
        e.preventDefault();
        const errs = {};
        if (!itemForm.itemName) errs.itemName = 'Tên không được để trống';
        setItemErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            await itemService.create({ itemName: itemForm.itemName });
            setShowItemModal(false);
            setItemForm({ itemName: '' });
            setItemErrors({});
            setItemPage(0);
            handleRefresh(); // Refresh list without reload
        } catch (err) {
            alert("Có lỗi xảy ra: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEditItem = async e => {
        e.preventDefault();
        const errs = {};
        if (!itemForm.itemName) errs.itemName = 'Tên không được để trống';
        setItemErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            await itemService.update(selectedItem.id, { itemName: itemForm.itemName });
            setShowItemModal(false);
            setItemForm({ itemName: '' });
            setItemErrors({});
            handleRefresh(); // Refresh list without reload
        } catch (err) {
            alert("Có lỗi xảy ra: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteItem = async id => {
        if (!window.confirm('Bạn có chắc muốn xóa item này?')) return;
        try {
            await itemService.delete(id);
            handleRefresh(); // Refresh list without reload
        } catch (err) {
            alert("Có lỗi xảy ra: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="section-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Quản lý Items (Danh mục mới)</h2>
                <button
                    style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                        setItemForm({ itemName: '' });
                        setItemErrors({});
                        setItemModalMode('create');
                        setShowItemModal(true);
                    }}
                >
                    <FaPlus /> Tạo mới
                </button>
            </div>
            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={itemSearch}
                    onChange={e => { setItemSearch(e.target.value); setItemPage(0); }}
                    style={{ padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: 240 }}
                />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                <thead>
                    <tr style={{ background: '#f0f4ff' }}>
                        <th style={{ padding: '8px', border: '1px solid #eee' }}>ID</th>
                        <th style={{ padding: '8px', border: '1px solid #eee' }}>Tên Item</th>
                        <th style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((item, idx) => (
                        <tr key={item.id || idx}>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>{item.id}</td>
                            <td style={{ padding: '8px', border: '1px solid #eee' }}>{item.itemName || item.name}</td>
                            <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Xem"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setItemForm({ itemName: item.itemName || item.name });
                                        setItemModalMode('view');
                                        setShowItemModal(true);
                                    }}><FaEye /></button>
                                <button style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Sửa"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setItemForm({ itemName: item.itemName || item.name });
                                        setItemModalMode('edit');
                                        setShowItemModal(true);
                                    }}><FaEdit /></button>
                                <button style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: 18, cursor: 'pointer' }} title="Xóa"
                                    onClick={() => handleDeleteItem(item.id)}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                <Pagination
                    currentPage={itemPage + 1}
                    totalPages={itemTotalPages}
                    onPageChange={page => setItemPage(page - 1)}
                />
            </div>
            {showItemModal && (
                <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, minHeight: 200, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
                        <button onClick={() => setShowItemModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
                        {loadingItem ? (
                            <LoadingPlaceholder count={1} height={120} />
                        ) : itemModalMode === 'view' && selectedItem ? (
                            <div>
                                <h3>Thông tin Item</h3>
                                <div><b>ID:</b> {selectedItem.id}</div>
                                <div><b>Tên:</b> {selectedItem.itemName || selectedItem.name}</div>
                            </div>
                        ) : itemModalMode === 'edit' && selectedItem ? (
                            <form onSubmit={handleEditItem} style={{ minWidth: 320 }}>
                                <h3>Cập nhật Item</h3>
                                <div style={{ marginBottom: 16 }}>
                                    <label>Tên Item:</label>
                                    <input value={itemForm.itemName} onChange={e => setItemForm(f => ({ ...f, itemName: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                                    {itemErrors.itemName && <div style={{ color: 'red', fontSize: 13 }}>{itemErrors.itemName}</div>}
                                </div>
                                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu</button>
                            </form>
                        ) : itemModalMode === 'create' ? (
                            <form onSubmit={handleCreateItem} style={{ minWidth: 320 }}>
                                <h3>Tạo Item mới</h3>
                                <div style={{ marginBottom: 16 }}>
                                    <label>Tên Item:</label>
                                    <input value={itemForm.itemName} onChange={e => setItemForm(f => ({ ...f, itemName: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                                    {itemErrors.itemName && <div style={{ color: 'red', fontSize: 13 }}>{itemErrors.itemName}</div>}
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
