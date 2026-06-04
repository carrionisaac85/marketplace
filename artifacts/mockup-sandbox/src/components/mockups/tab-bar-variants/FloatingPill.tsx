import React from 'react';
import { Home, List, MessageCircle, User } from 'lucide-react';

export function FloatingPill() {
  return (
    <div className="max-w-[390px] mx-auto h-[240px] overflow-hidden bg-white relative font-sans" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Simulated Content */}
      <div className="absolute inset-0 p-4 space-y-4 bg-[#F7F5F2]">
        <div className="h-20 bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-4 flex gap-4">
          <div className="w-12 h-12 bg-[#F7F5F2] rounded-xl animate-pulse"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-[#EBEBEB] rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-[#F7F5F2] rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="h-20 bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-4 flex gap-4">
          <div className="w-12 h-12 bg-[#F7F5F2] rounded-xl animate-pulse"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-[#EBEBEB] rounded w-2/3 animate-pulse"></div>
            <div className="h-3 bg-[#F7F5F2] rounded w-2/5 animate-pulse"></div>
          </div>
        </div>
        <div className="h-20 bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-4 flex gap-4 opacity-50">
          <div className="w-12 h-12 bg-[#F7F5F2] rounded-xl"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-[#EBEBEB] rounded w-3/4"></div>
            <div className="h-3 bg-[#F7F5F2] rounded w-1/3"></div>
          </div>
        </div>
      </div>

      {/* Floating Pill Tab Bar */}
      <div className="absolute bottom-4 left-0 right-0 px-5 flex justify-center">
        <div className="flex items-center justify-between w-full max-w-[350px] bg-white rounded-full shadow-2xl p-2 px-3 border border-black/5">
          
          <button className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#E84B2A] text-white transition-all shadow-md shadow-[#E84B2A]/20">
            <Home size={20} strokeWidth={2.5} />
            <span className="text-[13px] font-bold tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>Home</span>
          </button>
          
          <button className="flex items-center justify-center p-3 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#F7F5F2] rounded-full transition-all">
            <List size={22} strokeWidth={2} />
          </button>
          
          <button className="flex items-center justify-center p-3 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#F7F5F2] rounded-full transition-all relative">
            <MessageCircle size={22} strokeWidth={2} />
            <span className="absolute top-2.5 right-2 w-2 h-2 bg-[#E84B2A] rounded-full border border-white"></span>
          </button>
          
          <button className="flex items-center justify-center p-3 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#F7F5F2] rounded-full transition-all">
            <User size={22} strokeWidth={2} />
          </button>
          
        </div>
      </div>
    </div>
  );
}
