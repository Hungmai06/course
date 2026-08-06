import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../48ngay/hooks/useAuth'
import { useSEO } from '../hooks/useSEO'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export default function CommunityPage() {
  useSEO({
    title: 'Cộng đồng học tập ngoại ngữ',
    description: 'Kết nối và giao lưu trực tuyến cùng hàng ngàn học viên DolphinLearn. Tham gia trò chuyện cộng đồng, thảo luận học tập và gia nhập các nhóm Zalo/Facebook chia sẻ tài liệu miễn phí.',
    keywords: 'cộng đồng dolphinlearn, trò chuyện cộng đồng, nhóm học tiếng anh, nhóm học tiếng nhật, nhóm học tiếng trung'
  })

  const { isDlLoggedIn, dlUser } = useAuth()
  const [newMsg, setNewMsg] = useState('')
  const chatEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [messages, setMessages] = useState([])
  const isNearBottomRef = useRef(true) // track xem user có đang ở gần cuối không

  // Fetch chat messages from backend with polling
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/english/chat/messages`)
        if (res.ok) {
          const data = await res.json()
          if (data.code === 200 && data.data) {
            const formatted = data.data.map(msg => ({
              id: msg.id,
              sender: msg.sender,
              avatar: msg.avatar,
              text: msg.text,
              time: msg.time,
              isAdmin: msg.isAdmin,
              isMe: dlUser && msg.senderEmail === dlUser.email
            }))
            setMessages(formatted)
          }
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [dlUser])

  // Cuộn tin nhắn mới nhất trong khung chat - không cuộn trang chính
  useEffect(() => {
    if (isNearBottomRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Theo dõi vị trí scroll của user
  const handleChatScroll = () => {
    const container = chatContainerRef.current
    if (!container) return
    const threshold = 100 // px từ cuối
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    isNearBottomRef.current = distanceFromBottom <= threshold
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !isDlLoggedIn) return

    // Khi user tự gửi tin → cuộn xuống cuối
    isNearBottomRef.current = true

    try {
      const response = await fetch(`${API_BASE}/api/v1/english/chat/messages?email=${encodeURIComponent(dlUser.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newMsg })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.code === 201 && result.data) {
          const newFormatted = {
            id: result.data.id,
            sender: result.data.sender,
            avatar: result.data.avatar,
            text: result.data.text,
            time: result.data.time,
            isAdmin: result.data.isAdmin,
            isMe: true
          }
          setMessages(prev => [...prev, newFormatted])
          setNewMsg('')
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }


  const announcements = [
    {
      tag: 'Sự kiện',
      tagColor: 'bg-emerald-50 text-emerald-600',
      title: 'Chiến dịch "90 ngày bứt phá cùng DolphinLearn" chính thức khởi động!',
      desc: 'Học tập để nhận huy hiệu và quà tặng giá trị.',
      time: '2 giờ trước'
    },
    {
      tag: 'Tài liệu',
      tagColor: 'bg-amber-50 text-amber-600',
      title: 'Chia sẻ bộ Flashcard 2000 từ vựng cốt lõi (PDF)',
      desc: 'Tải miễn phí tại tab Tài liệu.',
      time: '1 ngày trước'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-indigo-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-primary/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-wider uppercase">Cộng đồng DolphinLearn</span>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-none">
            Học ngoại ngữ cùng hàng ngàn học viên mỗi ngày!
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Tham gia các nhóm trao đổi học tập, giao lưu cùng thầy cô bản xứ và bạn bè trên khắp cả nước để cùng tiến bộ nhanh hơn.
          </p>
        </div>
        
        {/* Background Decorative Circles */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/30 blur-2xl pointer-events-none" />
      </div>

      {/* Redesigned Facebook Group Section */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/40 rounded-3xl border border-indigo-100/70 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-4 max-w-xl z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
            <span className="material-symbols-outlined text-[12px] font-black">groups</span>
            Nhóm cộng đồng Facebook
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            Gia nhập nhóm học tập ngay hôm nay!
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Thảo luận bài tập khó, nhận đề thi thử THPT Quốc Gia có đáp án chi tiết và tham gia kho tài liệu PDF độc quyền cập nhật mỗi ngày hoàn toàn miễn phí.
          </p>
          
          {/* Key values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              "Cộng đồng học viên sôi nổi",
              "Hỏi đáp bài tập 24/7",
              "Đề thi thử & Tài liệu PDF free",
              "Chia sẻ kinh nghiệm học tập hiệu quả"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="material-symbols-outlined text-indigo-600 font-bold text-[18px]">check_circle</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 z-10 w-full md:w-auto flex flex-col items-center">
          {/* Interactive Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 w-full max-w-sm flex flex-col items-center text-center space-y-5 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <span className="material-symbols-outlined text-[36px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
            
            <div>
              <h3 className="font-display text-base font-black text-slate-800">Cộng đồng học sinh 2K9</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Hoàn toàn miễn phí</p>
            </div>

            <a 
              href="https://www.facebook.com/groups/380922997956806" 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              <span className="material-symbols-outlined text-[16px] font-black">login</span>
              Tham gia nhóm ngay
            </a>
          </div>
        </div>
      </div>

      {/* Full Width Chat Room */}
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display text-xl font-black text-slate-800">Trò chuyện cộng đồng</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">Giao lưu trực tuyến cùng các học viên khác</p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            142 học viên trực tuyến
          </span>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[520px] overflow-hidden relative">
          
          {/* Message List */}
          <div 
            ref={chatContainerRef}
            onScroll={handleChatScroll}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''} animate-fade-in`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${msg.isAdmin ? 'bg-amber-500 text-white' : msg.isMe ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {msg.avatar}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1 max-w-[70%]">
                  <div className={`flex items-center gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-extrabold text-slate-600">{msg.sender}</span>
                    {msg.isAdmin && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[8px] font-black uppercase">Admin</span>
                    )}
                    <span className="text-[9px] text-slate-400">{msg.time}</span>
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-100 bg-white relative">
            {isDlLoggedIn ? (
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Nhập tin nhắn trò chuyện cùng cộng đồng..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="btn btn-primary flex items-center justify-center shrink-0 p-3"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            ) : (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-10">
                <div className="text-center space-y-2">
                  <p className="text-xs font-black text-slate-800">Đăng nhập để tham gia trò chuyện cùng cộng đồng!</p>
                  <Link 
                    to="?auth=login" 
                    className="btn btn-primary"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
