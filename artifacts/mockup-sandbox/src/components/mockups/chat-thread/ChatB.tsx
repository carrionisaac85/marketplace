import React from "react";
import { ArrowLeft, Paperclip, Send, Car } from "lucide-react";

export function ChatB() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div 
        style={{
          width: 390,
          height: 844,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#F7F5F2",
          fontFamily: "'DM Sans', sans-serif",
          color: "#1A1A1A"
        }}
        className="flex flex-col mx-auto bg-[#F7F5F2]"
      >
        {/* Status Bar Placeholder */}
        <div className="h-12 w-full flex items-center justify-between px-6 pt-2 shrink-0 bg-white">
          <div className="text-[15px] font-semibold">9:41</div>
          <div className="flex gap-2 items-center">
            <div className="w-4 h-3 bg-black rounded-[2px]"></div>
            <div className="w-4 h-3 bg-black rounded-[2px]"></div>
            <div className="w-6 h-3 bg-black rounded-[2px]"></div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E8E4DF] shrink-0">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F5F2]">
            <ArrowLeft size={20} color="#1A1A1A" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[16px]">Isaac Carrion</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Sticky Deal Card */}
        <div className="bg-white border-b border-[#E8E4DF] shadow-sm shrink-0 z-10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#F7F5F2] flex items-center justify-center">
                <Car size={24} color="#888" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[16px] leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Porsche Macan</span>
                <span className="font-medium text-[#E84B2A] text-[13px] mt-0.5">💰 Current offer: $14</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button className="px-3 py-1.5 bg-[#10B981] text-white text-[12px] font-bold rounded-full">Accept</button>
              <button className="px-3 py-1.5 bg-[#F7F5F2] text-[#1A1A1A] text-[12px] font-bold rounded-full border border-[#E8E4DF]">Counter</button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
          
          {/* Message 1: Theirs */}
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E8E4DF] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#888]">IC</span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm border border-[#E8E4DF] max-w-[260px]">
                <p className="text-[15px] leading-snug">Hi, is this still available?</p>
              </div>
              <span className="text-[11px] text-[#888] px-1">10:42 AM</span>
            </div>
          </div>

          {/* Message 2: Mine */}
          <div className="flex items-end gap-2 justify-end">
            <div className="flex flex-col gap-1 items-end">
              <div className="bg-[#E84B2A] text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[260px]">
                <p className="text-[15px] leading-snug">Hey! Yes it is</p>
              </div>
              <span className="text-[11px] text-[#888] px-1">10:44 AM</span>
            </div>
          </div>

          {/* Message 3: Theirs */}
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E8E4DF] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#888]">IC</span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm border border-[#E8E4DF] max-w-[260px]">
                <p className="text-[15px] leading-snug">Great! Would you take $14 for it?</p>
              </div>
              <span className="text-[11px] text-[#888] px-1">10:45 AM</span>
            </div>
          </div>

          {/* Message 4: Mine */}
          <div className="flex items-end gap-2 justify-end">
            <div className="flex flex-col gap-1 items-end">
              <div className="bg-[#E84B2A] text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[260px]">
                <p className="text-[15px] leading-snug">I can do $14 if you can pick up today</p>
              </div>
              <span className="text-[11px] text-[#888] px-1">10:47 AM</span>
            </div>
          </div>

          {/* Message 5: Theirs */}
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E8E4DF] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#888]">IC</span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm border border-[#E8E4DF] max-w-[260px]">
                <p className="text-[15px] leading-snug">Sounds perfect. What time works?</p>
              </div>
              <span className="text-[11px] text-[#888] px-1">10:51 AM</span>
            </div>
          </div>

          {/* Message 6: Mine */}
          <div className="flex items-end gap-2 justify-end">
            <div className="flex flex-col gap-1 items-end">
              <div className="bg-[#E84B2A] text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[260px]">
                <p className="text-[15px] leading-snug">Anytime after 2pm works for me</p>
              </div>
              <span className="text-[11px] text-[#888] px-1">10:53 AM</span>
            </div>
          </div>

          {/* Message 7: Theirs */}
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E8E4DF] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#888]">IC</span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm border border-[#E8E4DF] max-w-[260px]">
                <p className="text-[15px] leading-snug">Perfect, see you at 3!</p>
              </div>
              <span className="text-[11px] text-[#888] px-1">10:55 AM</span>
            </div>
          </div>
          
          <div className="h-4 shrink-0"></div>
        </div>

        {/* Compose Bar */}
        <div className="bg-white border-t border-[#E8E4DF] shadow-[0_-4px_10px_rgba(0,0,0,0.03)] px-4 py-3 shrink-0 pb-8">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F7F5F2] hover:bg-[#E8E4DF] shrink-0 text-[#888]">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 bg-[#F7F5F2] rounded-full px-4 py-2.5 flex items-center border border-[#E8E4DF]">
              <input 
                type="text" 
                placeholder="Message Isaac..." 
                className="bg-transparent border-none outline-none w-full text-[15px] placeholder:text-[#888]"
              />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E84B2A] text-white shrink-0">
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
