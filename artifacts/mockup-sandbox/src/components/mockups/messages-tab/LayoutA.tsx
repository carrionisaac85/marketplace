import React from "react";
import { Home, Search, MessageSquare, User, ChevronRight } from "lucide-react";

export function LayoutA() {
  const conversations = [
    {
      id: "1",
      name: "Alex R.",
      initial: "A",
      wantTitle: "Vintage Leather Jacket",
      preview: "Yes, I can do $150. Can you meet today?",
      time: "2m",
      unread: true,
    },
    {
      id: "2",
      name: "Sarah M.",
      initial: "S",
      wantTitle: "1970s Film Camera",
      preview: "Is this still available?",
      time: "1h",
      unread: true,
    },
    {
      id: "3",
      name: "Mike T.",
      initial: "M",
      wantTitle: "Mid-Century Modern Chair",
      preview: "Thanks! I'll pick it up tomorrow.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: "4",
      name: "Jessica K.",
      initial: "J",
      wantTitle: "Vinyl Record Collection",
      preview: "I have a few questions about the condition.",
      time: "Mon",
      unread: false,
    },
    {
      id: "5",
      name: "David W.",
      initial: "D",
      wantTitle: "Acoustic Guitar",
      preview: "Sounds good, see you then.",
      time: "Oct 12",
      unread: false,
    },
  ];

  return (
    <div
      style={{
        width: 390,
        height: 844,
        backgroundColor: "#F7F5F2",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@700;800&display=swap');
          
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
      <div className="pt-14 pb-4 px-5 bg-white border-b" style={{ borderColor: "#E84B2A" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", color: "#1A1A1A", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Messages
        </h1>
        <p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>
          Your conversations with buyers and sellers.
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {conversations.map((convo, index) => (
          <div
            key={convo.id}
            className="group relative flex border-b"
            style={{ borderColor: "#E84B2A" }}
          >
            {/* The swipe-to-delete background */}
            <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center text-white text-sm font-medium">
              Delete
            </div>

            {/* The actual row content, horizontally scrollable for swipe effect */}
            <div
              className="w-full flex-shrink-0 flex items-center p-4 bg-white relative z-10 transition-transform hide-scrollbar overflow-x-auto snap-x snap-mandatory"
              style={{ backgroundColor: convo.unread ? "#FFF9F7" : "#FFFFFF", borderColor: "#E84B2A", borderBottomWidth: index === conversations.length - 1 ? 0 : 1 }}
            >
              <div className="w-[390px] flex-shrink-0 flex items-center snap-start pr-8">
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-[46px] h-[46px] rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: "#E84B2A" }}
                >
                  {convo.initial}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px]" style={{ color: "#1A1A1A" }}>
                        {convo.name}
                      </span>
                      {convo.unread && (
                        <span
                          className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold text-white tracking-wide"
                          style={{ backgroundColor: "#E84B2A" }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] font-medium" style={{ color: convo.unread ? "#E84B2A" : "#888" }}>
                      {convo.time}
                    </span>
                  </div>
                  
                  <p className="text-[13px] font-semibold truncate mb-0.5" style={{ color: "#1A1A1A" }}>
                    {convo.wantTitle}
                  </p>
                  
                  <p className="text-[14px] truncate" style={{ color: convo.unread ? "#1A1A1A" : "#888", fontWeight: convo.unread ? 600 : 400 }}>
                    {convo.preview}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-t flex justify-around items-center pt-3 pb-8 px-2 z-20" style={{ borderColor: "#E84B2A" }}>
        <div className="flex flex-col items-center gap-1 cursor-pointer" style={{ color: "#888" }}>
          <Search size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Browse</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer" style={{ color: "#888" }}>
          <Home size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Wants</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer" style={{ color: "#E84B2A" }}>
          <div className="relative">
            <MessageSquare size={24} strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: "#E84B2A" }}></div>
          </div>
          <span className="text-[10px] font-bold">Messages</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer" style={{ color: "#888" }}>
          <User size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>
    </div>
  );
}
