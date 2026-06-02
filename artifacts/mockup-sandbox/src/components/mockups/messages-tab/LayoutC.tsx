import React, { useState } from 'react';
import { Tag, ChevronDown, ChevronUp, Trash2, ArrowLeft, MoreHorizontal, MessageCircle } from 'lucide-react';

export function LayoutC() {
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    'group-2': true, // Collapsed by default
  });

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleSwipe = (id: string) => {
    setSwipedId(swipedId === id ? null : id);
  };

  const wants = [
    {
      id: 'group-1',
      title: 'Vintage Leica M6',
      unreadCount: 2,
      messages: [
        {
          id: 'msg-1',
          name: 'Sarah Miller',
          initials: 'SM',
          preview: "I have one in mint condition, just CLA'd last month.",
          time: '10:42 AM',
          unread: true,
        },
        {
          id: 'msg-2',
          name: 'David Chen',
          initials: 'DC',
          preview: 'Are you open to a trade for an M4?',
          time: 'Yesterday',
          unread: true,
        },
        {
          id: 'msg-3',
          name: 'Elena Rostova',
          initials: 'ER',
          preview: 'I can do $2500 if you can meet today.',
          time: 'Mon',
          unread: false,
        }
      ]
    },
    {
      id: 'group-2',
      title: 'Herman Miller Aeron Size B',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-4',
          name: 'James Wilson',
          initials: 'JW',
          preview: 'Thanks! Let me know if you change your mind.',
          time: 'Oct 12',
          unread: false,
        }
      ]
    },
    {
      id: 'group-3',
      title: 'Sony 35mm f/1.4 GM',
      unreadCount: 1,
      messages: [
        {
          id: 'msg-5',
          name: 'Michael Park',
          initials: 'MP',
          preview: 'Still looking for this lens? I just listed mine.',
          time: 'Oct 10',
          unread: true,
        }
      ]
    }
  ];

  return (
    <div style={{
      width: '390px', 
      height: '844px', 
      overflow: 'hidden', 
      fontFamily: '"DM Sans", sans-serif',
      backgroundColor: '#F7F5F2',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@600;700;800&display=swap');
          
          .font-syne { font-family: 'Syne', sans-serif; }
          
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 border-b flex items-center justify-between z-10" style={{ borderColor: '#E8E4DF' }}>
        <button className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={24} color="#1A1A1A" />
        </button>
        <h1 className="font-syne font-bold text-xl" style={{ color: '#1A1A1A' }}>Messages</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-gray-100">
          <MoreHorizontal size={24} color="#1A1A1A" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
        
        {wants.map((group) => {
          const isCollapsed = collapsedGroups[group.id];
          
          return (
            <div key={group.id} className="mb-4">
              {/* Section Header */}
              <div 
                className="px-4 py-3 flex items-center justify-between cursor-pointer sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm"
                style={{ backgroundColor: '#F7F5F2' }}
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded bg-white flex items-center justify-center shrink-0 border" style={{ borderColor: '#E8E4DF' }}>
                    <Tag size={12} color="#1A1A1A" />
                  </div>
                  <h2 className="font-syne font-bold text-base truncate" style={{ color: '#1A1A1A' }}>
                    {group.title}
                  </h2>
                  {group.unreadCount > 0 && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0" 
                      style={{ backgroundColor: '#E84B2A', color: '#FFFFFF' }}
                    >
                      {group.unreadCount} NEW
                    </span>
                  )}
                </div>
                <div className="shrink-0 ml-3">
                  {isCollapsed ? (
                    <ChevronDown size={20} color="#888" />
                  ) : (
                    <ChevronUp size={20} color="#888" />
                  )}
                </div>
              </div>

              {/* Messages */}
              <div 
                className={`bg-white border-y overflow-hidden transition-all duration-300 ease-in-out`}
                style={{ 
                  borderColor: '#E8E4DF',
                  maxHeight: isCollapsed ? '0px' : '1000px',
                  opacity: isCollapsed ? 0 : 1
                }}
              >
                {group.messages.map((msg, index) => (
                  <div 
                    key={msg.id} 
                    className="relative overflow-hidden group"
                  >
                    {/* Delete Action Background */}
                    <div 
                      className="absolute inset-y-0 right-0 w-24 flex items-center justify-center"
                      style={{ backgroundColor: '#E84B2A' }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Trash2 size={20} color="white" />
                        <span className="text-white text-xs font-medium">Delete</span>
                      </div>
                    </div>

                    {/* Message Row */}
                    <div 
                      className="relative bg-white flex items-center px-4 py-3 transition-transform duration-300 ease-out cursor-pointer hover:bg-gray-50"
                      style={{ 
                        transform: swipedId === msg.id ? 'translateX(-96px)' : 'translateX(0)',
                        borderBottom: index < group.messages.length - 1 ? '1px solid #E8E4DF' : 'none'
                      }}
                      onClick={() => handleSwipe(msg.id)}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: '#E84B2A', color: '#FFFFFF' }}
                        >
                          {msg.initials}
                        </div>
                        {msg.unread && (
                          <div 
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                            style={{ backgroundColor: '#E84B2A' }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 
                            className="font-semibold text-[15px] truncate"
                            style={{ color: '#1A1A1A' }}
                          >
                            {msg.name}
                          </h3>
                          <span 
                            className="text-xs shrink-0 ml-2"
                            style={{ 
                              color: msg.unread ? '#E84B2A' : '#888',
                              fontWeight: msg.unread ? '600' : '400'
                            }}
                          >
                            {msg.time}
                          </span>
                        </div>
                        <p 
                          className="text-sm truncate pr-2"
                          style={{ 
                            color: msg.unread ? '#1A1A1A' : '#888',
                            fontWeight: msg.unread ? '500' : '400'
                          }}
                        >
                          {msg.preview}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        <div className="px-4 py-8 flex flex-col items-center justify-center text-center opacity-60">
          <MessageCircle size={24} color="#888" className="mb-2" />
          <p className="text-sm" style={{ color: '#888' }}>No older messages</p>
        </div>
      </div>
      
      {/* Fake Bottom Nav Area for context */}
      <div className="absolute bottom-0 left-0 right-0 h-[34px] bg-white z-20"></div>
    </div>
  );
}
