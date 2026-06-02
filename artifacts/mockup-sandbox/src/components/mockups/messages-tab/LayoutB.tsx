import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const CONVERSATIONS = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    want: 'Vintage Leather Jacket',
    preview: 'Is this still available? I can come pick it up tomorrow afternoon if that works for you.',
    timestamp: '2m ago',
    unread: true,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    initials: 'MC',
    want: 'Harley Sportster Tank',
    preview: 'Thanks for the quick response! I will take it.',
    timestamp: '1h ago',
    unread: true,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    initials: 'ER',
    want: 'Mid-Century Credenza',
    preview: 'Could you provide the exact dimensions?',
    timestamp: 'Yesterday',
    unread: false,
  },
  {
    id: '4',
    name: 'David Kim',
    initials: 'DK',
    want: 'Fender Stratocaster',
    preview: 'Would you be willing to trade for a Telecaster?',
    timestamp: 'Tuesday',
    unread: false,
  },
  {
    id: '5',
    name: 'Alex Thompson',
    initials: 'AT',
    want: 'Vinyl Record Collection',
    preview: 'Let me know if you decide to split the collection.',
    timestamp: 'Oct 12',
    unread: false,
  },
];

function SwipeableCard({ convo, onDelete }: { convo: typeof CONVERSATIONS[0], onDelete: (id: string) => void }) {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    setIsSwiping(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    if (diff < 0) {
      setOffsetX(Math.max(diff, -100)); // Max swipe left is -100px
    } else {
      setOffsetX(Math.min(diff, 0)); // Don't allow swipe right beyond 0
    }
  };
  
  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (offsetX < -50) {
      setOffsetX(-80); // Snap open
    } else {
      setOffsetX(0); // Snap closed
    }
  };

  return (
    <div className="relative mb-4 mx-4 select-none">
      {/* Background Actions */}
      <div className="absolute inset-0 flex justify-end items-center rounded-2xl bg-red-500 overflow-hidden" style={{ zIndex: 0 }}>
        <button 
          onClick={() => onDelete(convo.id)}
          className="w-20 h-full flex items-center justify-center text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {/* Foreground Card */}
      <div 
        className={`relative z-10 w-full bg-white rounded-2xl flex flex-col p-4 shadow-sm border border-[#E84B2A]/5 overflow-hidden ${isSwiping ? '' : 'transition-transform duration-300'}`}
        style={{ 
          transform: `translateX(${offsetX}px)`,
          boxShadow: convo.unread ? '0 4px 20px -4px rgba(232, 75, 42, 0.1)' : '0 2px 8px -2px rgba(0,0,0,0.05)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Unread Accent Bar / Gradient */}
        {convo.unread && (
          <div className="absolute inset-y-0 left-0 w-1.5 bg-[#E84B2A]" />
        )}
        {convo.unread && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#E84B2A]/[0.03] to-transparent pointer-events-none" />
        )}

        <div className="flex justify-between items-start mb-3 pl-2">
          {/* Want Chip */}
          <div className="bg-[#F7F5F2] border border-[#E84B2A]/10 text-[#1A1A1A] text-xs font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E84B2A]/60" />
            {convo.want}
          </div>
          
          {/* Timestamp Pill */}
          <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${convo.unread ? 'bg-[#E84B2A]/10 text-[#E84B2A]' : 'bg-[#F7F5F2] text-[#888]'}`}>
            {convo.timestamp}
          </div>
        </div>

        <div className="flex gap-4 items-center pl-2">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-[56px] h-[56px] rounded-full bg-[#E84B2A] flex items-center justify-center text-white text-lg font-bold font-syne ${convo.unread ? 'ring-2 ring-offset-2 ring-[#E84B2A]' : ''}`}>
              {convo.initials}
            </div>
            {convo.unread && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E84B2A] border-2 border-white rounded-full" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-syne text-lg truncate ${convo.unread ? 'text-[#1A1A1A] font-bold' : 'text-[#1A1A1A]/80 font-semibold'}`}>
              {convo.name}
            </h3>
            <p className={`text-sm mt-0.5 line-clamp-2 leading-relaxed ${convo.unread ? 'text-[#1A1A1A] font-medium' : 'text-[#888]'}`}>
              {convo.preview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LayoutB() {
  const [conversations, setConversations] = useState(CONVERSATIONS);

  const handleDelete = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Syne:wght@400..800&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      <div 
        className="font-dm bg-[#F7F5F2] relative shadow-2xl"
        style={{ width: 390, height: 844, overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="pt-14 pb-4 px-6 bg-[#F7F5F2] sticky top-0 z-20 border-b border-[#E84B2A]/5">
          <h1 className="font-syne text-3xl font-bold text-[#1A1A1A] tracking-tight">Messages</h1>
        </div>

        {/* List Content */}
        <div className="h-full overflow-y-auto hide-scrollbar pb-32 pt-4">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#888] px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E84B2A]/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#E84B2A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-syne font-semibold text-lg text-[#1A1A1A]">No messages yet</p>
              <p className="text-sm mt-2">When you connect with others about wants, your conversations will appear here.</p>
            </div>
          ) : (
            <div>
              {conversations.map(convo => (
                <SwipeableCard key={convo.id} convo={convo} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
