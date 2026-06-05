import React from 'react';
import { MapPin, Eye, Zap, Flame, Clock, MessageCircle, ChevronRight, Activity, Search, Bell, HelpCircle, ChevronDown, Home, List, User } from 'lucide-react';

const cards = [
  {
    id: 1,
    trending: true,
    viewerCount: 12,
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    name: 'Alex M.',
    timeLabel: 'Posted 4 min ago',
    timeColor: '#E84B2A',
    budget: '$850',
    title: 'Mirrorless Digital Camera',
    desc: 'Looking for a lightly used Sony A6400 or similar with a kit lens. Needed for an upcoming trip this weekend.',
    img: '/__mockup/images/camera.jpg',
    distance: '1.2 mi away',
    offers: [
      'https://i.pravatar.cc/150?u=1',
      'https://i.pravatar.cc/150?u=2',
      'https://i.pravatar.cc/150?u=3',
    ],
    offersLabel: '3 sellers made offers',
    btnLabel: 'Make an Offer',
    btnStyle: 'dark' as const,
    extraBadge: null,
    viewing: null,
  },
  {
    id: 2,
    trending: false,
    viewerCount: 2,
    avatar: 'https://i.pravatar.cc/150?u=b042581f4e29026024d',
    name: 'Sarah T.',
    timeLabel: 'Just now',
    timeColor: '#2ECC71',
    budget: '$200',
    title: 'Ergonomic Desk Chair',
    desc: 'Starting a new WFH job. Need a Herman Miller Aeron or Steelcase Leap. Must be in good condition.',
    img: '/__mockup/images/chair.jpg',
    distance: '3.5 mi away',
    offers: null,
    offersLabel: null,
    btnLabel: 'Make an Offer',
    btnStyle: 'dark' as const,
    extraBadge: 'Fast replies',
    viewing: '2 viewing right now · Be the first to offer!',
  },
  {
    id: 3,
    trending: false,
    viewerCount: null,
    avatar: 'https://i.pravatar.cc/150?u=c042581f4e29026024d',
    name: 'Mike R.',
    timeLabel: 'Posted 2 hrs ago',
    timeColor: '#888',
    budget: '$150',
    title: 'Acoustic Guitar for Beginner',
    desc: 'Looking for a Yamaha FG800 or similar. Needs to be playable, minor scratches are fine.',
    img: '/__mockup/images/guitar.jpg',
    distance: '0.8 mi away',
    offers: [
      'https://i.pravatar.cc/150?u=4',
      'https://i.pravatar.cc/150?u=5',
    ],
    offersLabel: '5 total offers',
    btnLabel: 'View Offers & Compete',
    btnStyle: 'outline' as const,
    extraBadge: null,
    viewing: null,
  },
];

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#EBEBEB] rounded-lg text-xs font-medium text-[#1A1A1A] whitespace-nowrap" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {label}
      <ChevronDown className="w-3 h-3 text-[#888] ml-0.5" />
    </div>
  );
}

export function FullHome() {
  return (
    <div
      className="mx-auto overflow-hidden relative bg-[#F7F5F2]"
      style={{ width: 390, height: 844, fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A' }}
    >
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-[#EBEBEB] px-4 pt-12 pb-3 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-xl tracking-tight">
            Want - Board
          </h1>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#888]" />
            <div className="relative">
              <Bell className="w-5 h-5 text-[#888]" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E84B2A] border border-white" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F7F5F2] border border-[#EBEBEB] rounded-xl px-3 py-2.5 mb-3">
          <Search className="w-4 h-4 text-[#888] shrink-0" />
          <span className="text-sm text-[#888]">Search wants near you...</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 bg-white border border-[#EBEBEB] rounded-xl px-3 py-2 mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#E84B2A] shrink-0" />
          <span className="text-xs text-[#888]">Showing results near <strong className="text-[#1A1A1A]">Miami, Florida</strong></span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <FilterSelect label="All" />
          <FilterSelect label="Any Distance" />
          <FilterSelect label="🏷 Any budget" />
          <div className="ml-auto shrink-0 text-xs font-semibold text-[#888]" style={{ fontFamily: "'Syne', sans-serif" }}>
            26 <span className="font-normal">wants</span>
          </div>
        </div>
      </div>

      {/* ── FEED ── */}
      <div className="overflow-y-auto" style={{ height: 'calc(844px - 220px)', paddingBottom: 100 }}>
        <div className="p-3 space-y-4">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm">
              {/* Trending bar */}
              {card.trending && (
                <div className="bg-gradient-to-r from-[#E84B2A]/10 to-transparent px-4 py-2.5 flex items-center justify-between border-b border-[#E84B2A]/10">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#E84B2A]" />
                    <span className="text-xs font-semibold text-[#E84B2A]">Trending now</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#E84B2A] text-xs font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{card.viewerCount} viewing</span>
                  </div>
                </div>
              )}

              <div className="p-4">
                {/* User row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <img src={card.avatar} className="w-8 h-8 rounded-full border border-[#EBEBEB]" alt={card.name} />
                    <div>
                      <div className="text-sm font-bold">{card.name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-[#888]">
                        <Clock className="w-3 h-3" />
                        <span style={{ color: card.timeColor }} className="font-semibold">{card.timeLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-lg text-[#2ECC71]">{card.budget}</div>
                    <div className="text-[10px] text-[#888] font-medium uppercase">Budget</div>
                  </div>
                </div>

                {/* Title + desc */}
                <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-lg mb-1 leading-tight">{card.title}</h2>
                <p className="text-sm text-[#888] mb-3 line-clamp-2">{card.desc}</p>

                {/* Photo */}
                <img src={card.img} className="w-full h-40 object-cover rounded-xl mb-4 bg-[#F7F5F2]" alt={card.title} />

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-[#F7F5F2] text-[#1A1A1A] rounded-full">
                    <MapPin className="w-3 h-3 text-[#888]" /> {card.distance}
                  </div>
                  {card.extraBadge && (
                    <div className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-[#F7F5F2] text-[#1A1A1A] rounded-full border border-[#2ECC71]/30">
                      <Zap className="w-3 h-3 text-[#2ECC71]" /> {card.extraBadge}
                    </div>
                  )}
                </div>

                {/* Viewing line (no offers yet) */}
                {card.viewing && (
                  <div className="flex items-center gap-2 mb-3 text-xs font-medium text-[#888]">
                    <Eye className="w-3.5 h-3.5" /> {card.viewing}
                  </div>
                )}

                {/* Offer activity */}
                {card.offers && (
                  <div className="mb-4 bg-[#F7F5F2] rounded-xl p-3 flex items-center justify-between border border-[#EBEBEB]">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {card.offers.map((src, i) => (
                          <img key={i} src={src} className="w-6 h-6 rounded-full border-2 border-[#F7F5F2]" alt="" />
                        ))}
                        {card.id === 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-[#F7F5F2] bg-[#EBEBEB] flex items-center justify-center text-[10px] font-bold">+3</div>
                        )}
                      </div>
                      <div className="text-xs font-medium">
                        <span className="font-bold">{card.offersLabel}</span>
                      </div>
                    </div>
                    {card.id === 3
                      ? <div className="text-[11px] text-[#888] flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Reviewing</div>
                      : <Activity className="w-4 h-4 text-[#888]" />
                    }
                  </div>
                )}

                {/* CTA */}
                <button
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  style={card.btnStyle === 'dark'
                    ? { background: '#1A1A1A', color: '#fff', border: 'none', fontFamily: "'DM Sans', sans-serif" }
                    : { background: '#fff', color: '#1A1A1A', border: '1px solid #EBEBEB', fontFamily: "'DM Sans', sans-serif" }
                  }
                >
                  {card.btnLabel}
                  {card.btnStyle === 'dark' && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GLASSMORPHIC TAB BAR ── */}
      <div
        className="absolute bottom-6 left-4 right-4 rounded-2xl flex items-center justify-around px-2 z-40 border border-white/50"
        style={{
          height: 68,
          backgroundColor: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.6) inset',
        }}
      >
        {/* Active: Home */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer">
          <div className="w-10 h-10 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-[#E84B2A]/10" style={{ boxShadow: '0 0 14px rgba(232,75,42,0.35)' }} />
            <Home className="w-5 h-5 text-[#E84B2A] relative z-10" fill="currentColor" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-semibold text-[#E84B2A]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Home</span>
        </div>

        {/* My Wants */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer opacity-60">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <List className="w-5 h-5 text-[#888]" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium text-[#888]" style={{ fontFamily: "'DM Sans', sans-serif" }}>My Wants</span>
        </div>

        {/* Messages */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer opacity-60 relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center relative">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E84B2A] border-2 border-white" />
            <MessageCircle className="w-5 h-5 text-[#888]" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium text-[#888]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Messages</span>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer opacity-60">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-[#888]" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium text-[#888]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Profile</span>
        </div>
      </div>
    </div>
  );
}
