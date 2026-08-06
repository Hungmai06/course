import { useState } from 'react'

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState('colors')
  const [copiedText, setCopiedText] = useState('')
  const [streakCount, setStreakCount] = useState(7)
  const [gemCount, setGemCount] = useState(250)
  const [activeAvatarFrame, setActiveAvatarFrame] = useState('gold')
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [purchasedItems, setPurchasedItems] = useState({})
  
  // Progress Bar Width State
  const [progressWidth, setProgressWidth] = useState(65)

  // Copy helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 2000)
  }

  // Color tokens definitions
  const colors = {
    duolingo: [
      { name: 'duo-green', hex: '#58CC02', desc: 'Primary brand green' },
      { name: 'duo-green-dark', hex: '#46A302', desc: 'Bottom 3D border' },
      { name: 'duo-blue', hex: '#1CB0F6', desc: 'Secondary brand blue' },
      { name: 'duo-blue-dark', hex: '#1899D6', desc: 'Bottom 3D border' },
      { name: 'duo-orange', hex: '#FF9600', desc: 'Streak Orange' },
      { name: 'duo-orange-dark', hex: '#E68500', desc: 'Bottom 3D border' },
      { name: 'duo-purple', hex: '#C87FF6', desc: 'Level/Crown Purple' },
      { name: 'duo-purple-dark', hex: '#A560D0', desc: 'Bottom 3D border' },
      { name: 'duo-pink', hex: '#FF4B4B', desc: 'Hearts / Error Pink' },
      { name: 'duo-pink-dark', hex: '#EA2B2B', desc: 'Bottom 3D border' },
      { name: 'duo-gem', hex: '#15D48E', desc: 'Gems Green' },
      { name: 'duo-gem-dark', hex: '#0FA870', desc: 'Bottom 3D border' },
      { name: 'duo-gold', hex: '#FFC800', desc: 'Trophy / Reward Gold' },
      { name: 'duo-gold-dark', hex: '#E6B000', desc: 'Bottom 3D border' },
    ],
    supercell: [
      { name: 'sc-yellow', hex: '#FBC02D', desc: 'Gaming Yellow' },
      { name: 'sc-yellow-dark', hex: '#F57F17', desc: 'Bottom 3D border' },
      { name: 'sc-blue', hex: '#0288D1', desc: 'Gaming Action Blue' },
      { name: 'sc-blue-dark', hex: '#01579B', desc: 'Bottom 3D border' },
      { name: 'sc-purple', hex: '#7B1FA2', desc: 'Epic Purple' },
      { name: 'sc-purple-dark', hex: '#4A148C', desc: 'Bottom 3D border' },
      { name: 'sc-red', hex: '#D32F2F', desc: 'Legendary Red' },
      { name: 'sc-red-dark', hex: '#8E0000', desc: 'Bottom 3D border' },
    ],
    dashboard: [
      { name: 'surface', hex: '#F8FAFC', desc: 'App Main background' },
      { name: 'card', hex: '#FFFFFF', desc: 'Panel and Container background' },
      { name: 'text', hex: '#0F172A', desc: 'Main typography' },
      { name: 'text-muted', hex: '#64748B', desc: 'Supporting text' },
      { name: 'border', hex: '#E2E8F0', desc: 'Dividers & soft borders' },
      { name: 'neumorphic-bg', hex: '#E8EEF8', desc: 'Base for neumorphic elements' },
    ]
  }

  // Achievement Badges database
  const badges = [
    { id: 1, name: 'Bronze Dolphin', tier: 'Bronze', xp: 50, req: 'Complete 3 lessons', icon: 'water_drop', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'You took your first swim in the sea of knowledge! Keep splashing forward.', unlocked: true },
    { id: 2, name: 'Streak Pioneer', tier: 'Silver', xp: 150, req: 'Maintain a 7-day streak', icon: 'local_fire_department', color: 'text-slate-400 bg-slate-50 border-slate-200', desc: 'Consistency is key. You walked the hot trail of fire for a whole week.', unlocked: true },
    { id: 3, name: 'Gold Champion', tier: 'Gold', xp: 500, req: 'Accumulate 1,000 XP', icon: 'workspace_premium', color: 'text-amber-500 bg-amber-50 border-amber-200', desc: 'A legendary scholar is rising! Your dedication shines brighter than gold.', unlocked: true },
    { id: 4, name: 'Diamond Overlord', tier: 'Diamond', xp: 1200, req: 'Finish #1 on Leaderboard', icon: 'military_tech', color: 'text-cyan-500 bg-cyan-50 border-cyan-200', desc: 'You dominated the competitive arena. The diamond tier is yours to rule.', unlocked: true },
    { id: 5, name: 'Aqua Master', tier: 'Epic', xp: 2000, req: 'Unlock 48-day challenge', icon: 'sailing', color: 'text-violet-500 bg-violet-50 border-violet-200', desc: 'The ultimate deep-sea explorer. Fully completed the 48-day curriculum.', unlocked: false }
  ]

  // Shop items
  const shopItems = [
    { id: 'freeze', name: 'Streak Freeze', price: 200, desc: 'Allows your streak to remain in place if you miss a day of practice.', icon: 'ac_unit', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
    { id: 'double', name: 'Double or Nothing', price: 50, desc: 'Wager 50 gems to win 100 if you maintain a 7-day streak.', icon: 'casino', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { id: 'avatar_ruby', name: 'Ruby Champion Frame', price: 500, desc: 'Equip a glowing red ruby frame on your profile picture.', icon: 'palette', color: 'bg-rose-100 text-rose-600 border-rose-200' },
    { id: 'premium_ticket', name: 'Supercell Arena Entry', price: 350, desc: 'Ticket to participate in the upcoming Golden Tournament.', icon: 'local_activity', color: 'bg-amber-100 text-amber-600 border-amber-200' }
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-body py-10 px-4 md:px-8">
      {/* Design System Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-gradient-to-r from-duo-blue to-primary p-8 md:p-12 rounded-3xl text-white shadow-xl relative overflow-hidden card-3d border-b-[8px] border-duo-blue-dark">
          {/* Animated Blobs */}
          <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-white/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[250px] h-[250px] rounded-full bg-duo-green/20 blur-[60px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 backdrop-blur-md">
                <span className="material-symbols-outlined text-sm">palette</span>
                DolphinLearn Gamified Design System
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
                Playful UI Guidelines
              </h1>
              <p className="text-white/80 text-sm md:text-base mt-2 max-w-2xl font-medium leading-relaxed">
                Inspired by the friendly, high-contrast style of Duolingo, the solid 3D depth of Supercell games, and the crisp hierarchy of modern SaaS dashboards.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button 
                onClick={() => handleCopy('npm install -D tailwindcss')} 
                className="btn-3d btn-3d-green !py-3 !px-5 flex items-center gap-2 cursor-pointer font-bold text-xs"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
                {copiedText ? 'Copied!' : 'Copy Config'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-wrap gap-2.5 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          {[
            { id: 'colors', label: 'Color Tokens', icon: 'palette' },
            { id: 'typography', label: 'Typography Scale', icon: 'title' },
            { id: 'buttons', label: 'Button Variants', icon: 'smart_button' },
            { id: 'cards', label: 'Card Components', icon: 'web_stories' },
            { id: 'navigation', label: 'Sidebar Navigation', icon: 'side_navigation' },
            { id: 'progress', label: 'Progress Bars', icon: 'donut_large' },
            { id: 'gamification', label: 'Streak & Shop', icon: 'celebration' },
            { id: 'leaderboard', label: 'Leaderboard & Badges', icon: 'leaderboard' },
            { id: 'avatar', label: 'Avatar Builder', icon: 'face' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-xl text-xs md:text-sm font-extrabold tracking-tight transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-duo-blue text-white shadow-md shadow-duo-blue/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 md:p-10">
        
        {/* ==================== 1. COLORS TAB ==================== */}
        {activeTab === 'colors' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Color System</h2>
              <p className="text-slate-500 text-sm mt-1">Vibrant, fun colors with distinct light/dark pairs for beautiful 3D borders.</p>
            </div>

            {/* Duolingo Palette */}
            <h3 className="font-display font-extrabold text-base text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-duo-green" /> Duolingo Gaming Palette
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
              {colors.duolingo.map((c) => (
                <div 
                  key={c.name} 
                  onClick={() => handleCopy(`var(--color-${c.name})`)}
                  className="group cursor-pointer border border-slate-150 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white"
                >
                  <div className="h-16 w-full transition-transform group-hover:scale-[1.03]" style={{ backgroundColor: c.hex }} />
                  <div className="p-3">
                    <p className="text-xs font-black text-slate-800 truncate">--color-{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-extrabold">{c.hex}</p>
                    <p className="text-[9px] text-slate-500 mt-1 leading-tight">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Supercell Palette */}
            <h3 className="font-display font-extrabold text-base text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-sc-blue" /> Supercell Action Palette
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
              {colors.supercell.map((c) => (
                <div 
                  key={c.name} 
                  onClick={() => handleCopy(`var(--color-${c.name})`)}
                  className="group cursor-pointer border border-slate-150 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white"
                >
                  <div className="h-16 w-full transition-transform group-hover:scale-[1.03]" style={{ backgroundColor: c.hex }} />
                  <div className="p-3">
                    <p className="text-xs font-black text-slate-800 truncate">--color-{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-extrabold">{c.hex}</p>
                    <p className="text-[9px] text-slate-500 mt-1 leading-tight">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Palette */}
            <h3 className="font-display font-extrabold text-base text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-slate-500" /> SaaS Dashboard Core
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {colors.dashboard.map((c) => (
                <div 
                  key={c.name} 
                  onClick={() => handleCopy(`var(--color-${c.name})`)}
                  className="group cursor-pointer border border-slate-150 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white"
                >
                  <div className="h-16 w-full transition-transform group-hover:scale-[1.03]" style={{ backgroundColor: c.hex }} />
                  <div className="p-3">
                    <p className="text-xs font-black text-slate-800 truncate">--color-{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-extrabold">{c.hex}</p>
                    <p className="text-[9px] text-slate-500 mt-1 leading-tight">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Gradients Showcase */}
            <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-display font-extrabold text-sm text-slate-700 mb-3">Vibrant Gradients (Tailwind ready)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-duo-green to-duo-gem text-white font-extrabold text-xs shadow-md border-b-4 border-duo-green-dark">
                  from-duo-green to-duo-gem (Forest Health)
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-duo-blue to-primary text-white font-extrabold text-xs shadow-md border-b-4 border-duo-blue-dark">
                  from-duo-blue to-primary (Ocean Magic)
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-duo-orange to-duo-gold text-white font-extrabold text-xs shadow-md border-b-4 border-duo-orange-dark">
                  from-duo-orange to-duo-gold (Super Fire)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. TYPOGRAPHY TAB ==================== */}
        {activeTab === 'typography' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Typography Scale</h2>
              <p className="text-slate-500 text-sm mt-1">DolphinLearn uses Lexend for friendly display headers and Inter for crisp body copy.</p>
            </div>

            <div className="space-y-6">
              {/* Heading 1 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors gap-4">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-slate-400">DISPLAY EXTRA H1</p>
                  <p className="text-[10px] text-slate-500 font-mono">font-display font-black text-4xl</p>
                </div>
                <div className="flex-1">
                  <h1 className="font-display font-black text-4xl text-slate-800 leading-none">
                    Start learning, today!
                  </h1>
                </div>
              </div>

              {/* Heading 2 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors gap-4">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-slate-400">HEADER SECTIONS H2</p>
                  <p className="text-[10px] text-slate-500 font-mono">font-display font-extrabold text-2xl</p>
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-extrabold text-2xl text-slate-800">
                    Daily Streak Challenge
                  </h2>
                </div>
              </div>

              {/* Heading 3 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors gap-4">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-slate-400">COMPONENTS / LABELS H3</p>
                  <p className="text-[10px] text-slate-500 font-mono">font-display font-bold text-lg</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-slate-800">
                    Leaderboard Rankings
                  </h3>
                </div>
              </div>

              {/* Body Lead */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors gap-4">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-slate-400">BODY LEAD</p>
                  <p className="text-[10px] text-slate-500 font-mono">font-body font-medium text-base</p>
                </div>
                <div className="flex-1">
                  <p className="font-body font-medium text-base text-slate-600">
                    Consistently review your daily vocabulary set to unlock higher levels and earn chest rewards.
                  </p>
                </div>
              </div>

              {/* Body Standard */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors gap-4">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-slate-400">BODY STANDARD</p>
                  <p className="text-[10px] text-slate-500 font-mono">font-body text-sm</p>
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm text-slate-600">
                    We recommend dedicating 15 minutes each day to practicing. Standard users experience up to 4x speed in retention rates when completing daily quizzes.
                  </p>
                </div>
              </div>

              {/* Gaming Caps (Duolingo style buttons/chips) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors gap-4">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-slate-400">GAMING TEXT</p>
                  <p className="text-[10px] text-slate-500 font-mono">font-display font-extrabold uppercase tracking-wider text-xs</p>
                </div>
                <div className="flex-1">
                  <span className="font-display font-extrabold uppercase tracking-wider text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                    LEVEL COMPLETED
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. BUTTONS TAB ==================== */}
        {activeTab === 'buttons' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Button Variants</h2>
              <p className="text-slate-500 text-sm mt-1">3D gaming buttons that actually press down on active click, alongside elegant utility buttons.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 3D Buttons Showcase */}
              <div className="border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h4 className="font-display font-extrabold text-sm text-slate-700 mb-6">Duolingo-style 3D Buttons (Press to Test)</h4>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <button className="btn-3d btn-3d-green w-48">START LESSON</button>
                    <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">btn-3d btn-3d-green</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="btn-3d btn-3d-blue w-48">NEXT STEP</button>
                    <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">btn-3d btn-3d-blue</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="btn-3d btn-3d-orange w-48">CLAIM BONUS</button>
                    <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">btn-3d btn-3d-orange</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="btn-3d btn-3d-purple w-48">UNLOCK CROWN</button>
                    <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">btn-3d btn-3d-purple</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="btn-3d btn-3d-pink w-48">LOSE HEART</button>
                    <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">btn-3d btn-3d-pink</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="btn-3d btn-3d-gold w-48">BUY FOR 150 GEMS</button>
                    <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">btn-3d btn-3d-gold</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="btn-3d btn-3d-gray w-48" disabled>LOCKED LEVEL</button>
                    <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">btn-3d btn-3d-gray</code>
                  </div>
                </div>
              </div>

              {/* Elegant/Modern SaaS Buttons */}
              <div className="border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-700 mb-6">Modern SaaS & Social buttons</h4>
                  <div className="flex flex-col gap-4">
                    {/* Glassmorphism Button */}
                    <div className="flex items-center gap-4">
                      <button className="dl-glass-card hover:bg-white/80 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm">
                        <span className="material-symbols-outlined text-base">info</span> Glassmorphic Info
                      </button>
                      <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">dl-glass-card ...</code>
                    </div>

                    {/* Social Login: Google */}
                    <div className="flex items-center gap-4">
                      <button className="w-48 flex items-center justify-center gap-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-3 px-4 rounded-2xl shadow-sm transition-all cursor-pointer">
                        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.69 5.69 0 0 1 8.3 12.828a5.69 5.69 0 0 1 5.69-5.69c2.27 0 4.195 1.277 5.163 3.12l3.415-2.65A11.33 11.33 0 0 0 13.99 3c-6.236 0-11.29 5.054-11.29 11.29s5.054 11.29 11.29 11.29c6.046 0 10.518-4.249 10.518-10.7 0-.585-.054-1.127-.16-1.595H12.24Z"/></svg>
                        Sign in with Google
                      </button>
                      <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">Social Google</code>
                    </div>

                    {/* Facebook Button */}
                    <div className="flex items-center gap-4">
                      <button className="w-48 flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs py-3 px-4 rounded-2xl shadow-sm transition-all cursor-pointer">
                        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Sign in with Facebook
                      </button>
                      <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">Social Facebook</code>
                    </div>

                    {/* Standard Icon Action Button */}
                    <div className="flex items-center gap-4">
                      <button className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer shadow-sm hover:text-slate-800 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">settings</span>
                      </button>
                      <code className="text-[10px] bg-slate-50 p-2 rounded-lg font-mono flex-1 border border-slate-100">Circular Action</code>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
                  <p className="text-xs font-bold text-slate-500">HTML Structure Rule:</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Always use the <code className="bg-slate-200 px-1 rounded text-red-500 font-mono">active</code> pseudo-class to shift the translate value to 0 to trigger the pressed effect.
                  </p>
                </div>
              </div>
            </div>

            {/* 2025 Gamified Button System Section */}
            <div className="border border-slate-200/80 rounded-2xl p-6 shadow-sm mt-8 bg-slate-50/50">
              <h4 className="font-display font-extrabold text-sm text-slate-700 mb-2">2025 Modern Gamified Button System</h4>
              <p className="text-xs text-slate-500 mb-6">Designed as a high-contrast blend of Duolingo-style action feedback, Notion-like structural simplicity, and Supercell gaming polish.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Primary Button */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col justify-between items-center text-center gap-4 shadow-sm hover:shadow transition-shadow">
                  <div className="h-16 flex items-center justify-center">
                    <button className="btn-gamified-primary">
                      Primary Action
                    </button>
                  </div>
                  <div className="w-full text-left">
                    <p className="text-xs font-black text-slate-800">Primary Button</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">.btn-gamified-primary</p>
                    <ul className="text-[10px] text-slate-500 mt-2 list-disc list-inside space-y-0.5">
                      <li>Gradient #4F46E5 → #7C3AED</li>
                      <li>Hover: scale(1.03) + brighter</li>
                      <li>Capsule rounded-full (999px)</li>
                    </ul>
                  </div>
                </div>

                {/* Success Button */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col justify-between items-center text-center gap-4 shadow-sm hover:shadow transition-shadow">
                  <div className="h-16 flex items-center justify-center">
                    <button className="btn-gamified-success">
                      Success Action
                    </button>
                  </div>
                  <div className="w-full text-left">
                    <p className="text-xs font-black text-slate-800">Success Button</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">.btn-gamified-success</p>
                    <ul className="text-[10px] text-slate-500 mt-2 list-disc list-inside space-y-0.5">
                      <li>Solid Green (#84CC16)</li>
                      <li>3D border bottom shadow</li>
                      <li>Pill shape rounded-full</li>
                    </ul>
                  </div>
                </div>

                {/* Coin Button */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col justify-between items-center text-center gap-4 shadow-sm hover:shadow transition-shadow">
                  <div className="h-16 flex items-center justify-center">
                    <button className="btn-gamified-coin">
                      <span className="material-symbols-outlined text-[18px]">monetization_on</span>
                      1,500 Coins
                    </button>
                  </div>
                  <div className="w-full text-left">
                    <p className="text-xs font-black text-slate-800">Coin Button</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">.btn-gamified-coin</p>
                    <ul className="text-[10px] text-slate-500 mt-2 list-disc list-inside space-y-0.5">
                      <li>Gold color (#FBBF24)</li>
                      <li>Amber thick border (3D effect)</li>
                      <li>Integrated currency symbol</li>
                    </ul>
                  </div>
                </div>

                {/* XP Button */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col justify-between items-center text-center gap-4 shadow-sm hover:shadow transition-shadow">
                  <div className="h-16 flex items-center justify-center">
                    <button className="btn-gamified-xp">
                      <span className="material-symbols-outlined text-[18px]">diamond</span>
                      +100 XP
                    </button>
                  </div>
                  <div className="w-full text-left">
                    <p className="text-xs font-black text-slate-800">XP Button</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">.btn-gamified-xp</p>
                    <ul className="text-[10px] text-slate-500 mt-2 list-disc list-inside space-y-0.5">
                      <li>Purple color (#A855F7)</li>
                      <li>Glow shadow effect</li>
                      <li>Active click compression</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. CARDS TAB ==================== */}
        {activeTab === 'cards' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Card Components</h2>
              <p className="text-slate-500 text-sm mt-1">Stunning containers leveraging flat designs, soft neumorphic shadows, and 3D frames.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Duolingo 3D Card */}
              <div className="card-3d p-6 relative hover:scale-[1.01] transition-transform">
                <div className="absolute top-4 right-4 bg-duo-purple/10 text-duo-purple font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-duo-purple/20">
                  POPULAR
                </div>
                <span className="material-symbols-outlined text-duo-purple text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <h3 className="font-display font-extrabold text-lg text-slate-800">3D Game Card</h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                  Has solid 3D border effects with clean light and dark border styles. Hovering improves color saturation.
                </p>
                <div className="mt-6 border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold">12 Lessons</span>
                  <button className="btn-3d btn-3d-blue !py-2 !px-4 !text-[11px]">GO</button>
                </div>
              </div>

              {/* Soft Neumorphic Card */}
              <div className="neumorphic-flat p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-duo-orange text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-slate-850">Neumorphic Flat</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                    Employs double soft shadow offsets (`#D1D9E6` and `#FFFFFF`) to create physical depth from a solid background.
                  </p>
                </div>
                <div className="mt-6 pt-2">
                  <div className="neumorphic-inset p-3 text-center text-xs font-black text-slate-600 tracking-tight">
                    CURRENT SYSTEM OK
                  </div>
                </div>
              </div>

              {/* Premium Glassmorphic Card */}
              <div className="dl-glass-card p-6 rounded-3xl border border-white/60 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] rounded-full bg-blue-300/30 blur-[20px] pointer-events-none" />
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-150 mb-4">
                    <span className="material-symbols-outlined text-primary text-xl">blur_on</span>
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-slate-800">Glassmorphism</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                    Uses backdrop-filter blur and semi-transparent white fills to overlay beautifully above background gradients.
                  </p>
                </div>
                <div className="mt-6 flex gap-2">
                  <button className="bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-extrabold text-[10px] py-2 px-3.5 rounded-xl shadow-xs transition-colors flex-1 cursor-pointer">
                    Dismiss
                  </button>
                  <button className="bg-primary text-white font-extrabold text-[10px] py-2 px-3.5 rounded-xl hover:bg-primary-dark transition-colors flex-1 cursor-pointer">
                    Agree
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 5. NAVIGATION TAB ==================== */}
        {activeTab === 'navigation' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Sidebar Navigation</h2>
              <p className="text-slate-500 text-sm mt-1">Playful sticky side-nav layout showcasing app identity, user status, and gamification links.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Responsive Mock Sidebar */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-md max-w-sm mx-auto w-full">
                <div className="flex items-center gap-2.5 pb-6 mb-6 border-b border-slate-150">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                  <span className="font-display text-lg font-black text-primary tracking-tight">DolphinLearn</span>
                </div>

                {/* Nav items list */}
                <nav className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black bg-primary/10 text-primary shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">home</span>
                    Trang chủ
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    Tài liệu
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">translate</span>
                    Từ vựng
                    <span className="ml-auto bg-duo-pink text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">NEW</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                    Bảng xếp hạng
                  </div>
                </nav>

                {/* User quick widget */}
                <div className="mt-20 pt-4 border-t border-slate-150">
                  <div className="flex justify-around items-center bg-slate-50 rounded-2xl py-2 px-1 mb-4">
                    <span className="flex items-center gap-1 text-[10px] font-black text-accent-dark">
                      <span className="material-symbols-outlined text-[16px] text-duo-orange" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      {streakCount} ngày
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black text-primary">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      {gemCount} XP
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-2xl border border-slate-150 bg-white">
                    <div className="w-8 h-8 rounded-full bg-duo-purple flex items-center justify-center font-bold text-xs text-white shrink-0">
                      DL
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-[11px] font-black text-slate-800 truncate">Nguyễn Học Viên</p>
                      <p className="text-[9px] text-slate-400 truncate">level 5 • Bronze</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">settings</span>
                  </div>
                </div>
              </div>

              {/* Sidebar layout specifications */}
              <div className="lg:col-span-8 space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-display font-extrabold text-sm text-slate-700 mb-3">Responsive Sidebar Rules</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                    <li><strong className="text-slate-800">Mobile Layout:</strong> Stretches horizontally as a top header bar with a floating z-index burger menu toggle.</li>
                    <li><strong className="text-slate-800">Desktop Layout:</strong> Solid sticky column fixed at `w-64` spanning `h-screen`, saving layout shifts during navigation.</li>
                    <li><strong className="text-slate-800">Interactivity:</strong> Sidebar items utilize `NavLink` from `react-router-dom` to automatically track current URL path and overlay a beautiful &lt;span className="bg-primary/10 text-primary"&gt; highlight.</li>
                    <li><strong className="text-slate-800">Avatar Integration:</strong> Bottom widget displays user stats (Streak/XP) dynamically synced from state managers or localStorage caches.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 6. PROGRESS BARS TAB ==================== */}
        {activeTab === 'progress' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Progress Indicators</h2>
              <p className="text-slate-500 text-sm mt-1">Chunky progress bars with metallic reflection highlights and playful value chips.</p>
            </div>

            <div className="space-y-8 max-w-2xl">
              
              {/* Interactive controller */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4 justify-between">
                <span className="text-xs font-bold text-slate-600">Simulate Progress Width:</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setProgressWidth(Math.max(10, progressWidth - 15))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    - 15%
                  </button>
                  <span className="text-xs font-black text-slate-800 w-12 text-center">{progressWidth}%</span>
                  <button 
                    onClick={() => setProgressWidth(Math.min(100, progressWidth + 15))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    + 15%
                  </button>
                </div>
              </div>

              {/* Chunky Green (Health/Success Progress) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-slate-700">
                  <span className="font-display tracking-wider">LESSON PROGRESS</span>
                  <span className="bg-duo-green/10 text-duo-green px-2 py-0.5 rounded-full">{progressWidth}/100 XP</span>
                </div>
                <div className="progress-3d">
                  <div 
                    className="progress-3d-fill bg-duo-green" 
                    style={{ width: `${progressWidth}%`, borderBottom: `4px solid ${colors.duolingo[1].hex}` }} 
                  />
                </div>
              </div>

              {/* Chunky Blue (Level progression) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-slate-700">
                  <span className="font-display tracking-wider">CURRICULUM LEVEL 4</span>
                  <span className="bg-duo-blue/10 text-duo-blue px-2 py-0.5 rounded-full">{progressWidth}% Complete</span>
                </div>
                <div className="progress-3d">
                  <div 
                    className="progress-3d-fill bg-duo-blue" 
                    style={{ width: `${progressWidth}%`, borderBottom: `4px solid ${colors.duolingo[3].hex}` }} 
                  />
                </div>
              </div>

              {/* Mini Health Hearts Live system (Duolingo style) */}
              <div className="p-6 border border-slate-200 rounded-2xl">
                <h4 className="font-display font-extrabold text-sm text-slate-750 mb-3">Lives / Hearts Health Indicator</h4>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((heart) => (
                    <span 
                      key={heart} 
                      className={`material-symbols-outlined text-2xl transition-all cursor-pointer ${
                        heart <= 3 ? 'text-duo-pink animate-pulse' : 'text-slate-300'
                      }`}
                      style={heart <= 3 ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      favorite
                    </span>
                  ))}
                  <span className="text-xs font-black text-slate-500 ml-2">(3 / 5 Hearts remaining)</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 7. STREAK & SHOP TAB ==================== */}
        {activeTab === 'gamification' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Streak & Reward Shop</h2>
              <p className="text-slate-500 text-sm mt-1">Calendar grids, stats dashboard, and coin/point trading shops to drive daily retention.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Calendar Streak Component */}
              <div className="lg:col-span-5 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-extrabold text-sm text-slate-700">Calendar Streak</h3>
                    <div className="flex items-center gap-1 font-display font-black text-xs text-duo-orange bg-duo-orange/15 px-3 py-1.5 rounded-full border border-duo-orange/20 animate-streak-fire">
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      {streakCount} Days Active
                    </div>
                  </div>

                  {/* 7 Days Grid */}
                  <div className="grid grid-cols-7 gap-2.5 mb-6">
                    {[
                      { name: 'M', active: true, freeze: false },
                      { name: 'T', active: true, freeze: false },
                      { name: 'W', active: true, freeze: false },
                      { name: 'T', active: true, freeze: false },
                      { name: 'F', active: true, freeze: false },
                      { name: 'S', active: true, freeze: false },
                      { name: 'S', active: false, freeze: true }
                    ].map((day, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <div 
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-display font-black text-xs transition-all relative ${
                            day.active 
                              ? 'bg-duo-orange text-white border-duo-orange-dark border-b-4' 
                              : day.freeze
                                ? 'bg-cyan-150 text-cyan-700 border-cyan-300 border-b-4'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {day.active ? (
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                          ) : day.freeze ? (
                            <span className="material-symbols-outlined text-sm">ac_unit</span>
                          ) : (
                            day.name
                          )}
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400">{day.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats columns */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400">LONGEST STREAK</p>
                      <p className="font-display font-black text-lg text-slate-800">48 Days</p>
                    </div>
                    <div className="text-center border-l border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400">FREEZE SLOT</p>
                      <p className="font-display font-black text-lg text-cyan-600 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-base">ac_unit</span> Active
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button 
                    onClick={() => setStreakCount(prev => prev + 1)}
                    className="btn-3d btn-3d-orange flex-1 !py-2.5 !text-xs"
                  >
                    Simulate Daily Study
                  </button>
                </div>
              </div>

              {/* Reward Shop UI Component */}
              <div className="lg:col-span-7 border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display font-extrabold text-sm text-slate-700">Point Shop / Inventory</h3>
                  <div className="flex items-center gap-1.5 font-display font-black text-xs text-duo-gem bg-duo-gem/10 px-3 py-1.5 rounded-full border border-duo-gem/20">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                    {gemCount} Gems Available
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shopItems.map((item) => {
                    const owned = purchasedItems[item.id] || false
                    const canAfford = gemCount >= item.price

                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-2xl flex flex-col justify-between transition-all ${
                          owned 
                            ? 'bg-slate-50 border-slate-250 opacity-90' 
                            : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center border text-lg shrink-0 ${item.color}`}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              {item.name}
                              {owned && (
                                <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">OWNED</span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                            <span className="material-symbols-outlined text-duo-gem text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                            {item.price}
                          </span>

                          <button 
                            disabled={owned || !canAfford}
                            onClick={() => {
                              setGemCount(prev => prev - item.price)
                              setPurchasedItems(prev => ({ ...prev, [item.id]: true }))
                            }}
                            className={`btn-3d !py-1.5 !px-3.5 !text-[10px] ${
                              owned 
                                ? 'btn-3d-gray' 
                                : canAfford 
                                  ? 'btn-3d-gold' 
                                  : 'btn-3d-gray opacity-60'
                            }`}
                          >
                            {owned ? 'Equipped' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 8. LEADERBOARD TAB ==================== */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Competitive Arena & Achievements</h2>
              <p className="text-slate-500 text-sm mt-1">Supercell-style crown podiums, competitive badges, and detail drawers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Podium Display (Top 3 Users) */}
              <div className="lg:col-span-5 border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-display font-extrabold text-sm text-slate-700 mb-8 text-center">Weekly Arena Top 3</h3>
                
                <div className="grid grid-cols-3 items-end gap-2 max-w-sm mx-auto">
                  {/* Rank 2 (Left) */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-sm font-bold text-white border-2 border-slate-200 shadow-md">
                        JD
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 border-white shadow">
                        2
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 text-center truncate w-full">Jane Doe</p>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-t-xl mt-3 h-20 flex flex-col items-center justify-center gap-1 p-1">
                      <span className="text-[9px] font-black text-slate-600">850 XP</span>
                    </div>
                  </div>

                  {/* Rank 1 (Middle - Taller) */}
                  <div className="flex flex-col items-center transform -translate-y-2">
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full bg-duo-gold flex items-center justify-center text-lg font-bold text-white border-2 border-amber-300 shadow-lg relative">
                        AL
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <span className="material-symbols-outlined text-[12px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      </div>
                    </div>
                    <p className="text-xs font-black text-slate-800 text-center truncate w-full">Alex Level</p>
                    <div className="w-full bg-amber-50 border border-amber-250 rounded-t-xl mt-3 h-28 flex flex-col items-center justify-center gap-1 p-1 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-amber-400" />
                      <span className="text-[10px] font-black text-amber-700">1,250 XP</span>
                    </div>
                  </div>

                  {/* Rank 3 (Right) */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div className="w-12 h-12 rounded-full bg-orange-300 flex items-center justify-center text-sm font-bold text-white border-2 border-orange-200 shadow-md">
                        KB
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 border-white shadow">
                        3
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 text-center truncate w-full">Kevin B.</p>
                    <div className="w-full bg-orange-50 border border-orange-200 rounded-t-xl mt-3 h-16 flex flex-col items-center justify-center gap-1 p-1">
                      <span className="text-[9px] font-black text-orange-700">720 XP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements Badges System */}
              <div className="lg:col-span-7 border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-display font-extrabold text-sm text-slate-700 mb-6">Interactive Badges Showcase</h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {badges.map((badge) => (
                    <div 
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`badge-3d border-2 p-3 rounded-2xl flex flex-col items-center justify-between text-center cursor-pointer ${badge.color}`}
                    >
                      <div className="relative">
                        <span className={`material-symbols-outlined text-3xl ${badge.unlocked ? '' : 'text-slate-300'}`} style={badge.unlocked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {badge.unlocked ? badge.icon : 'lock'}
                        </span>
                      </div>
                      <p className="text-[10px] font-black mt-3 truncate w-full">{badge.name}</p>
                      <span className="text-[8px] font-bold uppercase text-slate-400 mt-1">{badge.tier}</span>
                    </div>
                  ))}
                </div>

                {/* Badge detail drawer/modal (simulated) */}
                <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px] flex items-center justify-center">
                  {selectedBadge ? (
                    <div className="w-full flex items-start gap-4">
                      <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0 ${selectedBadge.color}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{selectedBadge.icon}</span>
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800">{selectedBadge.name}</h4>
                          <span className="bg-primary/15 text-primary text-[8px] font-black px-2 py-0.5 rounded-md">+{selectedBadge.xp} XP BONUS</span>
                        </div>
                        <p className="text-[9px] font-extrabold text-slate-400 mt-0.5">Requirement: {selectedBadge.req}</p>
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{selectedBadge.desc}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Click an achievement badge above to view detailed specifications.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 9. AVATAR BUILDER TAB ==================== */}
        {activeTab === 'avatar' && (
          <div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">Avatar & Profile System</h2>
              <p className="text-slate-500 text-sm mt-1">Playful characters, customizable background cards, and special frame tiers representing user rankings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Interactive Frame Customizer */}
              <div className="border border-slate-200 rounded-3xl p-6 shadow-sm bg-slate-50 flex flex-col items-center">
                <h4 className="font-display font-extrabold text-sm text-slate-700 mb-6 w-full text-center">Interactive Profile Frame preview</h4>
                
                {/* Simulated Avatar Box */}
                <div className="relative w-32 h-32 mb-6">
                  {/* Outer Frame Decoration */}
                  <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                    activeAvatarFrame === 'none' ? 'border-slate-300' :
                    activeAvatarFrame === 'bronze' ? 'border-amber-700 shadow-md ring-4 ring-amber-700/10' :
                    activeAvatarFrame === 'gold' ? 'border-amber-400 shadow-lg ring-4 ring-amber-400/25' :
                    'border-cyan-400 shadow-xl ring-8 ring-cyan-400/15'
                  }`} />
                  
                  {/* Avatar Picture */}
                  <div className="absolute inset-2 bg-gradient-to-tr from-duo-purple to-duo-pink rounded-full flex items-center justify-center text-white font-display font-black text-3xl border-2 border-white overflow-hidden shadow-inner">
                    DP
                  </div>

                  {/* Rating League Badge */}
                  {activeAvatarFrame !== 'none' && (
                    <div className="absolute bottom-[-5px] right-[-5px] w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center">
                      <span className={`material-symbols-outlined text-lg ${
                        activeAvatarFrame === 'bronze' ? 'text-amber-700' :
                        activeAvatarFrame === 'gold' ? 'text-amber-400' :
                        'text-cyan-500'
                      }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {activeAvatarFrame === 'bronze' ? 'shield' :
                         activeAvatarFrame === 'gold' ? 'workspace_premium' :
                         'military_tech'}
                      </span>
                    </div>
                  )}

                  {/* Active Status Dot */}
                  <div className="absolute top-1.5 left-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                </div>

                <div className="text-center mb-6">
                  <p className="text-sm font-black text-slate-800">Dolphin Scholar</p>
                  <p className="text-xs text-slate-400">Bronze League Arena Veteran</p>
                </div>

                {/* Frame Selectors */}
                <div className="flex gap-2 w-full max-w-xs justify-center">
                  {[
                    { id: 'none', label: 'Default' },
                    { id: 'bronze', label: 'Bronze' },
                    { id: 'gold', label: 'Gold' },
                    { id: 'diamond', label: 'Diamond' }
                  ].map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setActiveAvatarFrame(frame.id)}
                      className={`flex-1 text-center py-2 px-1 text-[10px] font-black rounded-xl border transition-all cursor-pointer ${
                        activeAvatarFrame === frame.id
                          ? 'bg-duo-blue text-white border-duo-blue-dark border-b-4'
                          : 'bg-white text-slate-600 border-slate-250 hover:bg-slate-50'
                      }`}
                    >
                      {frame.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar specifications */}
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-display font-extrabold text-sm text-slate-700 mb-3">Avatar Asset Rules</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                    <li><strong className="text-slate-800">Active status indicator:</strong> A pulsing green dot (`bg-emerald-500 border-2 border-white`) aligned to top left.</li>
                    <li><strong className="text-slate-800">League borders:</strong> Custom styling based on current user tier. Higher leagues display glowing shadows and thick ring outline borders.</li>
                    <li><strong className="text-slate-800">Badge attachments:</strong> Small circular icons placed at the bottom right quadrant. Employs `shield` symbols to preserve semantic clarity.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
