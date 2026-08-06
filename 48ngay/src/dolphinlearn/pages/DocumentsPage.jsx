import { useState, useEffect } from 'react'
import { useSEO } from '../hooks/useSEO'

const SHOPEE_LINK = "https://s.shopee.vn/5L9aBvPxg0";

const setCookie = (name, value, seconds) => {
  const date = new Date();
  date.setTime(date.getTime() + (seconds * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export default function DocumentsPage() {
  useSEO({
    title: 'Kho tài liệu ngoại ngữ miễn phí',
    description: 'Tải tài liệu luyện thi, đề thi thử, từ vựng PDF ôn thi THPT Quốc Gia, IELTS, HSK (Tiếng Anh, Tiếng Nhật, Tiếng Trung) chất lượng cao hoàn toàn miễn phí.',
    keywords: 'tài liệu tiếng anh, đề thi thử thpt, tài liệu ôn thi ielts, tài liệu tiếng nhật, tài liệu tiếng trung'
  })

  const [documents, setDocuments] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [activeDetailDoc, setActiveDetailDoc] = useState(null)
  const [showSponsorPopup, setShowSponsorPopup] = useState(false)
  const [hasClickedShopee, setHasClickedShopee] = useState(() => sessionStorage.getItem('dl_shopee_clicked') === 'true')

  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  // On mobile, opening a new tab can reload this page and reset state.
  // Restore popup + hasClickedShopee from sessionStorage so user can proceed.
  useEffect(() => {
    const alreadyClicked = sessionStorage.getItem('dl_shopee_clicked') === 'true'
    const pendingDocRaw = sessionStorage.getItem('dl_pending_doc')
    if (alreadyClicked && pendingDocRaw) {
      try {
        const pendingDoc = JSON.parse(pendingDocRaw)
        setActiveDetailDoc(pendingDoc)
        setHasClickedShopee(true)
        setShowSponsorPopup(true)
      } catch (e) {
        sessionStorage.removeItem('dl_pending_doc')
        sessionStorage.removeItem('dl_shopee_clicked')
      }
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, docRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/english/documents/categories`),
          fetch(`${API_BASE}/api/v1/english/documents?size=1000`)
        ])

        if (!catRes.ok || !docRes.ok) throw new Error('Failed to fetch documents data')

        const catData = await catRes.json()
        const docData = await docRes.json()

        setCategories(catData.data || [])
        
        if (docData.data) {
          if (Array.isArray(docData.data)) {
            setDocuments(docData.data)
          } else if (docData.data.content && Array.isArray(docData.data.content)) {
            setDocuments(docData.data.content)
          } else {
            setDocuments([])
          }
        } else {
          setDocuments([])
        }
      } catch (error) {
        console.error('Error fetching documents page:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [API_BASE])

  const proceedToView = async (doc) => {
    // ⚠️ Phải gọi window.open TRƯỚC await để browser mobile không chặn popup
    // (mobile chỉ cho phép mở tab mới trong luồng đồng bộ của user gesture)
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank')
    }
    // Sau đó mới ghi lượt xem (bất đồng bộ, không ảnh hưởng đến việc mở link)
    try {
      await fetch(`${API_BASE}/api/v1/english/documents/${doc.id}/view`, { method: 'POST' })
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, views: (d.views || 0) + 1 } : d))
      setActiveDetailDoc(prev => prev && prev.id === doc.id ? { ...prev, views: (prev.views || 0) + 1 } : prev)
    } catch (error) {
      console.error('Failed to increment view count:', error)
    }
  }

  const handleOpenDetails = (doc) => {
    setActiveDetailDoc(doc)
  }

  const handleXemNgayClick = (doc) => {
    const isUnlocked = getCookie('dl_doc_sponsor_unlocked') || getCookie('dl_vocab_sponsor_unlocked')
    if (isUnlocked) {
      proceedToView(doc)
    } else {
      // Store the pending doc so we can open it after page reload on mobile
      sessionStorage.setItem('dl_pending_doc', JSON.stringify(doc))
      sessionStorage.removeItem('dl_shopee_clicked')
      setHasClickedShopee(false)
      setShowSponsorPopup(true)
    }
  }

  const handleSponsorConfirm = () => {
    setCookie('dl_doc_sponsor_unlocked', 'true', 86400)
    sessionStorage.removeItem('dl_shopee_clicked')
    sessionStorage.removeItem('dl_pending_doc')
    setShowSponsorPopup(false)
    if (activeDetailDoc) {
      proceedToView(activeDetailDoc)
    }
  }

  const handleCopyLink = (doc) => {
    const shareUrl = `${window.location.origin}/documents?id=${doc.id}`
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setToastMessage(`Đã sao chép link tài liệu: ${doc.title}`)
        setTimeout(() => setToastMessage(''), 2500)
      })
      .catch(err => {
        console.error('Failed to copy link: ', err)
      })
  }

  useEffect(() => {
    if (!loading && documents.length > 0) {
      const queryParams = new URLSearchParams(window.location.search)
      const docId = queryParams.get('id')
      if (docId) {
        const doc = documents.find(d => Number(d.id) === Number(docId))
        if (doc) {
          setSelectedDocId(doc.id)
          setActiveDetailDoc(doc)
          // Increment views silently
          fetch(`${API_BASE}/api/v1/english/documents/${doc.id}/view`, { method: 'POST' }).catch(err => console.error(err))
          setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, views: (d.views || 0) + 1 } : d))
          // Clean URL parameters
          const newUrl = window.location.pathname
          window.history.replaceState({}, document.title, newUrl)
        }
      }
    }
  }, [loading, documents, API_BASE])

  const filtered = documents.filter(d => {
    if (selectedDocId) {
      return d.id === selectedDocId
    }
    const title = d.title || ''
    const desc = d.description || ''
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory ? (Number(d.categoryId) === Number(activeCategory)) : true
    return matchSearch && matchCat
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Kho tài liệu</h1>
          <p className="text-text-muted">Khám phá và học tập các tài liệu ngoại ngữ chất lượng cao</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-lg">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
          <input type="text" className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-border focus:border-primary focus:ring-3 focus:ring-primary/10 outline-none transition-all text-sm" placeholder="Tìm kiếm tài liệu..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button onClick={() => setActiveCategory(null)} className={`btn ${!activeCategory ? "btn-primary" : "btn-secondary"} !rounded-full !px-4 !py-2 !text-sm cursor-pointer`}>
            Tất cả
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`btn ${activeCategory === cat.id ? "btn-primary" : "btn-secondary"} !rounded-full !px-4 !py-2 !text-sm flex items-center gap-1.5 cursor-pointer`}>
              <span className="material-symbols-outlined text-[16px]">{cat.icon || 'folder'}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Shared Document Info Banner */}
        {selectedDocId && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center gap-2.5 text-blue-700 font-semibold text-sm">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <span>Bạn đang xem tài liệu được chia sẻ riêng biệt</span>
            </div>
            <button 
              onClick={() => setSelectedDocId(null)} 
              className="btn btn-primary !px-3 !py-1.5 !text-xs cursor-pointer"
            >
              Hiển thị tất cả tài liệu
            </button>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-border mb-4 block">search_off</span>
            <p className="text-text-muted">Không tìm thấy tài liệu nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((doc, idx) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDetails(doc)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${selectedDocId === doc.id ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'bg-white border-border hover:border-primary/40 hover:bg-slate-50/60'}`}
              >
                {/* Index number */}
                <span className="text-xs font-bold text-slate-300 w-5 text-center shrink-0 select-none">{idx + 1}</span>

                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>

                {/* Title */}
                <span className="flex-1 text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors truncate">
                  {doc.title}
                </span>

                {/* Views */}
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0 mr-1" onClick={e => e.stopPropagation()}>
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  <span>{doc.views || 0}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyLink(doc); }}
                    className="p-1.5 text-slate-400 rounded-lg hover:bg-slate-100 hover:text-primary transition-all flex items-center justify-center cursor-pointer"
                    title="Sao chép link chia sẻ"
                  >
                    <span className="material-symbols-outlined text-[16px]">share</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenDetails(doc); }}
                    className="btn btn-primary !px-3 !py-1.5 !text-xs cursor-pointer"
                  >
                    Xem
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-slate-900/95 backdrop-blur text-white text-xs md:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl z-[9999] flex items-center gap-2 transition-all duration-300 transform translate-y-0">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Document Detail Modal */}
        {activeDetailDoc && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
            onClick={() => setActiveDetailDoc(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-lg w-full p-5 md:p-8 shadow-2xl border border-slate-100 relative animate-[dlPopIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards] max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={() => setActiveDetailDoc(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>

              {/* Header / Title */}
              <div className="flex items-start gap-4 mb-6 pr-8 text-left">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">description</span>
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-wide mb-1.5">
                    Tài liệu học tập
                  </span>
                  <h3 className="font-display font-extrabold text-slate-800 text-lg md:text-xl leading-snug break-words">
                    {activeDetailDoc.title}
                  </h3>
                </div>
              </div>

              {/* Views count */}
              <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-4 bg-slate-50 px-3 py-1.5 rounded-xl w-fit">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>{activeDetailDoc.views || 0} lượt xem</span>
              </div>

              {/* Description section */}
              <div className="mb-6 text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Thông tin mô tả
                </label>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                  {activeDetailDoc.description || "Không có mô tả chi tiết cho tài liệu này."}
                </div>
              </div>

              {/* Community Section */}
              <div className="mb-8 text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Hỗ trợ & Trao đổi học tập
                </label>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                      <span className="material-symbols-outlined text-[22px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Cộng đồng DolphinLearn</h4>
                      <p className="text-[10px] text-text-muted mt-0.5 font-medium">Hỏi đáp & nhận tài liệu PDF free</p>
                    </div>
                  </div>
                  <a 
                    href="https://www.facebook.com/groups/380922997956806" 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-3d btn-3d-purple !px-4 !py-2 !text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    Tham gia
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCopyLink(activeDetailDoc)}
                  className="btn btn-secondary !py-3 !px-4 !text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  title="Sao chép link chia sẻ"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Chia sẻ
                </button>
                <button
                  onClick={() => handleXemNgayClick(activeDetailDoc)}
                  className="btn btn-primary flex-1 !py-3 !text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                  Xem ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shopee Sponsor Modal */}
        {showSponsorPopup && (
          <div className="sponsor-popup-overlay">
            <div className="sponsor-popup-box">
              <span className="sponsor-popup-heart">❤️</span>
              <h2 className="sponsor-popup-title">Ủng Hộ Dự Án</h2>
              <p className="sponsor-popup-text">
                Để có thêm kinh phí duy trì máy chủ, vui lòng click ủng hộ chúng tôi tại link dưới đây! Không bắt buộc mua đâu nhé, chỉ cần click xem thôi là đã giúp đỡ Admin rất nhiều rồi ạ!
              </p>
              <div className="sponsor-popup-actions">
                <a
                  href={SHOPEE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-btn-shopee"
                  style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
                  onClick={() => {
                    sessionStorage.setItem('dl_shopee_clicked', 'true')
                    setHasClickedShopee(true)
                  }}
                >
                  📖 Xem Sách Tiếng Anh Bổ Trợ
                </a>
                <button
                  className="sponsor-btn-close"
                  onClick={handleSponsorConfirm}
                  disabled={!hasClickedShopee}
                >
                  {hasClickedShopee ? "Đóng & Xem Tài Liệu" : "Vui lòng click link ủng hộ phía trên trước 🔒"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
