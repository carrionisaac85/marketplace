import React from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';

export function ChatA() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div 
        style={{
          width: 390, 
          height: 844, 
          overflow: 'hidden', 
          position: 'relative',
          backgroundColor: '#FFFFFF',
          fontFamily: '"DM Sans", sans-serif',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="mx-auto border border-[#E8E4DF] shadow-sm mt-8"
      >
        {/* Status Bar Placeholder */}
        <div style={{ height: 44, backgroundColor: '#F7F5F2' }} className="w-full flex-shrink-0" />

        {/* Header */}
        <div style={{ backgroundColor: '#F7F5F2', borderBottom: '1px solid #E8E4DF' }} className="flex flex-col items-center px-4 pb-3 relative flex-shrink-0">
          <div className="flex items-center w-full justify-between h-10 mt-1">
            <button className="text-[#E84B2A] flex items-center justify-center w-8 h-8 -ml-2">
              <ArrowLeft size={26} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-[-10px]">
              <div className="w-10 h-10 rounded-full bg-[#E84B2A] flex items-center justify-center text-white font-bold text-lg mb-1">
                IC
              </div>
              <h1 className="text-[#1A1A1A] font-bold text-[15px] leading-none mb-1.5">Isaac Carrion</h1>
              <div className="bg-[#E84B2A]/10 text-[#E84B2A] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Porsche Macan
              </div>
            </div>
            <div className="w-8 h-8" />
          </div>
        </div>

        {/* Offer Banner */}
        <div className="bg-[#FFF5F3] py-2 px-4 flex justify-center items-center border-b border-[#E84B2A]/10 flex-shrink-0 shadow-sm z-10 relative">
          <span className="text-[#E84B2A] text-[11px] font-bold tracking-widest uppercase">
            💰 Offer: $14
          </span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 bg-[#FFFFFF]">
          {/* Timestamp */}
          <div className="text-center text-[#888] text-[11px] font-bold uppercase tracking-wider my-2">
            Today 1:42 PM
          </div>

          {/* Theirs */}
          <div className="flex items-end gap-2 w-full max-w-[85%]">
            <div className="w-[30px] h-[30px] rounded-full bg-[#E84B2A] flex-shrink-0 flex items-center justify-center text-white font-bold text-[11px] mb-1">
              IC
            </div>
            <div className="relative bg-[#F0EDE9] text-[#1A1A1A] px-4 py-2.5 rounded-2xl rounded-bl-sm text-[15px] leading-snug">
              Hi, is this still available?
            </div>
          </div>

          {/* Mine */}
          <div className="flex justify-end w-full">
            <div className="relative bg-[#E84B2A] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-[15px] leading-snug max-w-[75%]">
              Hey! Yes it is
            </div>
          </div>

          {/* Theirs */}
          <div className="flex items-end gap-2 w-full max-w-[85%]">
             <div className="w-[30px] h-[30px] rounded-full bg-[#E84B2A] flex-shrink-0 flex items-center justify-center text-white font-bold text-[11px] mb-1">
              IC
            </div>
            <div className="relative bg-[#F0EDE9] text-[#1A1A1A] px-4 py-2.5 rounded-2xl rounded-bl-sm text-[15px] leading-snug">
              Great! Would you take $14 for it?
            </div>
          </div>

          {/* Mine */}
          <div className="flex justify-end w-full mt-1">
            <div className="relative bg-[#E84B2A] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-[15px] leading-snug max-w-[75%]">
              I can do $14 if you can pick up today
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center text-[#888] text-[11px] font-bold uppercase tracking-wider mt-4 mb-2">
            Today 1:55 PM
          </div>

          {/* Theirs */}
          <div className="flex items-end gap-2 w-full max-w-[85%]">
             <div className="w-[30px] h-[30px] rounded-full bg-[#E84B2A] flex-shrink-0 flex items-center justify-center text-white font-bold text-[11px] mb-1">
              IC
            </div>
            <div className="relative bg-[#F0EDE9] text-[#1A1A1A] px-4 py-2.5 rounded-2xl rounded-bl-sm text-[15px] leading-snug">
              Sounds perfect. What time works?
            </div>
          </div>

          {/* Mine */}
          <div className="flex justify-end w-full mt-1">
            <div className="relative bg-[#E84B2A] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-[15px] leading-snug max-w-[75%]">
              Anytime after 2pm works for me
            </div>
          </div>

          {/* Theirs */}
          <div className="flex items-end gap-2 w-full max-w-[85%] mt-1">
             <div className="w-[30px] h-[30px] rounded-full bg-[#E84B2A] flex-shrink-0 flex items-center justify-center text-white font-bold text-[11px] mb-1">
              IC
            </div>
            <div className="relative bg-[#F0EDE9] text-[#1A1A1A] px-4 py-2.5 rounded-2xl rounded-bl-sm text-[15px] leading-snug">
              Perfect, see you at 3!
            </div>
          </div>

        </div>

        {/* Compose Bar */}
        <div className="px-4 py-3 pb-8 bg-[#F7F5F2] border-t border-[#E8E4DF] flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full border border-[#E8E4DF] px-4 py-2.5 flex items-center shadow-sm">
              <input 
                type="text" 
                placeholder="Message..." 
                className="w-full bg-transparent outline-none text-[#1A1A1A] text-[15px] placeholder-[#888]"
              />
            </div>
            <button className="w-10 h-10 rounded-full bg-[#E84B2A] flex items-center justify-center flex-shrink-0 text-white shadow-sm hover:bg-[#D43F1F] transition-colors">
              <ArrowUp size={22} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
