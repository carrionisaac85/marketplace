import React, { useState } from 'react';

const TAB_ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  home: (a) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline fill="none" points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  list: (a) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  message: (a) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  user: (a) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const TABS = [
  { id: 'browse', icon: 'home', label: 'Home' },
  { id: 'mine', icon: 'list', label: 'My Wants' },
  { id: 'messages', icon: 'message', label: 'Messages' },
  { id: 'myprofile', icon: 'user', label: 'Profile' },
];

const FEED_CARDS = [
  { user: 'Alex M.', init: 'A', time: '2m ago', title: 'Looking for vintage Rolex Submariner', desc: 'Preferably pre-2000, box and papers a plus. Happy to pay fair market.', budget: 8500, category: 'Collectibles', offers: 4, color: '#E84B2A' },
  { user: 'Jamie K.', init: 'J', time: '11m ago', title: 'Need Sony A7 IV mirrorless body', desc: 'Body only, low shutter count. Open to grey market.', budget: 2200, category: 'Electronics', offers: 2, color: '#2563EB' },
  { user: 'Sam R.', init: 'S', time: '25m ago', title: 'Mid-century dining table set', desc: 'Looking for 4–6 chairs and a solid wood table. Eames-era vibes preferred.', budget: 1800, category: 'Furniture', offers: 0, color: '#16A34A' },
  { user: 'Chris L.', init: 'C', time: '1h ago', title: 'Acoustic guitar — Martin or Taylor', desc: '000 or OM body size, cedar or sitka top. Must be in good playing condition.', budget: 900, category: 'Music', offers: 1, color: '#9333EA' },
  { user: 'Dana W.', init: 'D', time: '2h ago', title: 'Nike Air Jordan 1 Retro High OG', desc: 'Size US 10.5, Chicago or Bred colorway, DS or VNDS only.', budget: 450, category: 'Fashion', offers: 6, color: '#EA580C' },
];

export default function Glassmorphic() {
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div
      style={{
        width: 390,
        height: 844,
        position: 'relative',
        background: '#F7F5F2',
        fontFamily: '"DM Sans", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Status bar */}
      <div style={{ height: 44, background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M1 9l11-7 11 7v13H1z" opacity=".2"/><path d="M17 9H7M12 9v13" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="2" y="7" width="4" height="11" rx="1"/><rect x="9" y="4" width="4" height="14" rx="1"/><rect x="16" y="1" width="4" height="17" rx="1"/></svg>
          <svg viewBox="0 0 24 24" width="18" height="14" fill="currentColor"><rect x="1" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="3" y="7" width="11" height="10" rx="1"/><path d="M21 9v6a2 2 0 0 0 0-6z"/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '8px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 22, color: '#1A1A1A', lineHeight: 1.1 }}>WantBoard</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>What are you looking for today?</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E84B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>A</div>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {['All', 'Electronics', 'Furniture', 'Collectibles', 'Fashion', 'Music'].map((c, i) => (
          <div key={c} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 100, background: i === 0 ? '#E84B2A' : '#fff', color: i === 0 ? '#fff' : '#888', fontSize: 12, fontWeight: 600, border: '1px solid', borderColor: i === 0 ? '#E84B2A' : '#EBEBEB' }}>{c}</div>
        ))}
      </div>

      {/* Scrollable feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', paddingBottom: 120, display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(844px - 44px - 74px - 50px)', scrollbarWidth: 'none' }}>
        {FEED_CARDS.map((card, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', boxShadow: '0 1px 6px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            {/* Trending banner */}
            {card.offers >= 3 && (
              <div style={{ background: 'linear-gradient(to right,rgba(232,75,42,0.09),transparent)', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#E84B2A', borderBottom: '1px solid rgba(232,75,42,0.08)' }}>
                🔥 Trending
                <span style={{ marginLeft: 'auto', fontSize: 10 }}>👁 {card.offers * 3 + 5} viewing</span>
              </div>
            )}
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 8px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: card.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{card.init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{card.user}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{card.time}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ background: 'rgba(46,204,113,0.12)', color: '#16A34A', borderRadius: 100, padding: '3px 8px', fontSize: 12, fontWeight: 700 }}>${card.budget.toLocaleString()}</div>
                <div style={{ fontSize: 15, color: '#888' }}>☆</div>
              </div>
            </div>
            {/* Body */}
            <div style={{ padding: '0 14px 12px' }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.3 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{card.desc}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: card.offers > 0 ? 10 : 8 }}>
                <div style={{ background: '#F7F5F2', borderRadius: 100, padding: '3px 8px', fontSize: 11, color: '#888', fontWeight: 600 }}>{card.category}</div>
              </div>
              {/* Activity strip */}
              {card.offers > 0 && (
                <div style={{ background: '#F7F5F2', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, border: '1px solid #EBEBEB' }}>
                  <div style={{ display: 'flex' }}>
                    {Array.from({ length: Math.min(card.offers, 3) }).map((_, j) => (
                      <div key={j} style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #F7F5F2', background: ['#E84B2A', '#2563EB', '#16A34A'][j % 3], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', marginLeft: j === 0 ? 0 : -5 }}>{String.fromCharCode(65 + j)}</div>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: '#1A1A1A', fontWeight: 500 }}><strong>{card.offers}</strong> seller{card.offers !== 1 ? 's' : ''} offered</span>
                </div>
              )}
              {/* CTA */}
              <button style={{ width: '100%', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Make an Offer →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Glassmorphic nav — exact match to real app */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        height: 68,
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 4px',
        backgroundColor: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,.08)',
        border: '1px solid rgba(255,255,255,0.5)',
        zIndex: 10,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                flex: 1,
                color: isActive ? '#E84B2A' : '#888',
                opacity: isActive ? 1 : 0.65,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 10,
                fontWeight: 500,
                transition: 'all .15s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                {isActive && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(232,75,42,0.1)', boxShadow: '0 0 12px rgba(232,75,42,0.4)' }} />
                )}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex' }}>
                  {TAB_ICONS[tab.icon]?.(isActive)}
                </div>
                {tab.id === 'messages' && (
                  <div style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#E84B2A', borderRadius: '50%', border: '2px solid #fff', zIndex: 2 }} />
                )}
              </div>
              <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
