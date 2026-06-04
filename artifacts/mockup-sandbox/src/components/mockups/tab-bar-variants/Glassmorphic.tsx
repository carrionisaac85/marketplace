import React from 'react';
import { Home, List, MessageCircle, User } from 'lucide-react';

export default function Glassmorphic() {
  return (
    <div className="max-w-[390px] mx-auto h-[240px] overflow-hidden bg-white relative font-['DM_Sans',sans-serif]">
      {/* Simulated Content Area (Feed) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7F5F2] to-white pt-6 px-4">
        {/* Fake Feed Cards */}
        <div className="space-y-4">
          <div className="h-[120px] w-full rounded-2xl bg-white shadow-sm border border-[#EBEBEB] p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-32 h-4 bg-[#F7F5F2] rounded-full"></div>
              <div className="w-12 h-4 bg-[#F7F5F2] rounded-full"></div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="w-full h-3 bg-[#F7F5F2] rounded-full"></div>
              <div className="w-2/3 h-3 bg-[#F7F5F2] rounded-full"></div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#EBEBEB]"></div>
              <div className="w-20 h-3 bg-[#F7F5F2] rounded-full"></div>
            </div>
          </div>
          
          <div className="h-[120px] w-full rounded-2xl bg-white shadow-sm border border-[#EBEBEB] p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-40 h-4 bg-[#F7F5F2] rounded-full"></div>
              <div className="w-16 h-4 bg-[#F7F5F2] rounded-full"></div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="w-full h-3 bg-[#F7F5F2] rounded-full"></div>
              <div className="w-5/6 h-3 bg-[#F7F5F2] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic Tab Bar */}
      <div 
        className="absolute bottom-4 left-4 right-4 h-[68px] rounded-2xl flex items-center justify-around px-2 z-10 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        {/* Active Tab: Home */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
          >
            <div 
              className="absolute inset-0 rounded-full bg-[#E84B2A]/10"
              style={{ boxShadow: '0 0 12px rgba(232,75,42,0.4)' }}
            ></div>
            <Home className="w-5 h-5 text-[#E84B2A] relative z-10" fill="currentColor" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-medium text-[#E84B2A]" style={{ fontFamily: '"DM Sans", sans-serif' }}>Home</span>
        </div>

        {/* Tab: My Wants */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <List className="w-5 h-5 text-[#888]" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium text-[#888]" style={{ fontFamily: '"DM Sans", sans-serif' }}>My Wants</span>
        </div>

        {/* Tab: Messages */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center relative">
            {/* Notification dot */}
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E84B2A] border-2 border-white"></div>
            <MessageCircle className="w-5 h-5 text-[#888]" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium text-[#888]" style={{ fontFamily: '"DM Sans", sans-serif' }}>Messages</span>
        </div>

        {/* Tab: Profile */}
        <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-[#888]" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium text-[#888]" style={{ fontFamily: '"DM Sans", sans-serif' }}>Profile</span>
        </div>
      </div>
    </div>
  );
}
