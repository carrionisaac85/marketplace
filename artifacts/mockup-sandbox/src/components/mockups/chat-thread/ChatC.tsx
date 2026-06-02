import React from "react";
import { ArrowUp, X } from "lucide-react";

export function ChatC() {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#F7F5F2",
        fontFamily: "'DM Sans', sans-serif",
        color: "#1A1A1A",
      }}
      className="flex flex-col"
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@700;800&display=swap');
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      {/* Status Bar Placeholder */}
      <div className="h-[44px] w-full shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4 pt-2 shrink-0 border-b border-[#E8E4DF]/50">
        <div>
          <h1
            className="text-[28px] leading-tight text-[#1A1A1A]"
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Isaac Carrion
          </h1>
          <p className="text-[13px] text-[#888888] font-medium mt-0.5">
            Re: Porsche Macan
          </p>
        </div>
        <button className="h-8 w-8 rounded-full bg-[#E8E4DF]/50 flex items-center justify-center text-[#1A1A1A] hover:bg-[#E8E4DF] transition-colors">
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-4 pt-6 pb-24">
        
        {/* Deal Chip */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#E84B2A]/5 border border-[#E84B2A]/10 text-[#E84B2A] text-[13px] font-medium px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <span>💰</span>
            <span>$14 offer · tap to review</span>
          </div>
        </div>

        {/* Date/Time Divider */}
        <div className="flex justify-center mb-6">
          <span className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
            Today, 9:41 AM
          </span>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-4">
          {/* Theirs */}
          <div className="flex justify-start">
            <div className="bg-[#E8E4DF] text-[#1A1A1A] px-4 py-2.5 rounded-[12px] max-w-[80%] text-[15px] leading-relaxed">
              Hi, is this still available?
            </div>
          </div>
          
          {/* Mine */}
          <div className="flex justify-end">
            <div className="bg-[#E84B2A] text-white px-4 py-2.5 rounded-[12px] max-w-[80%] text-[15px] leading-relaxed">
              Hey! Yes it is
            </div>
          </div>

          {/* Theirs */}
          <div className="flex justify-start">
            <div className="bg-[#E8E4DF] text-[#1A1A1A] px-4 py-2.5 rounded-[12px] max-w-[80%] text-[15px] leading-relaxed">
              Great! Would you take $14 for it?
            </div>
          </div>

          {/* Mine */}
          <div className="flex justify-end">
            <div className="bg-[#E84B2A] text-white px-4 py-2.5 rounded-[12px] max-w-[80%] text-[15px] leading-relaxed">
              I can do $14 if you can pick up today
            </div>
          </div>

          {/* Time Divider */}
          <div className="flex justify-center my-2">
            <span className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
              2:14 PM
            </span>
          </div>

          {/* Theirs */}
          <div className="flex justify-start">
            <div className="bg-[#E8E4DF] text-[#1A1A1A] px-4 py-2.5 rounded-[12px] max-w-[80%] text-[15px] leading-relaxed">
              Sounds perfect. What time works?
            </div>
          </div>

          {/* Mine */}
          <div className="flex justify-end">
            <div className="bg-[#E84B2A] text-white px-4 py-2.5 rounded-[12px] max-w-[80%] text-[15px] leading-relaxed">
              Anytime after 2pm works for me
            </div>
          </div>

          {/* Theirs */}
          <div className="flex justify-start">
            <div className="bg-[#E8E4DF] text-[#1A1A1A] px-4 py-2.5 rounded-[12px] max-w-[80%] text-[15px] leading-relaxed">
              Perfect, see you at 3!
            </div>
          </div>
        </div>
      </div>

      {/* Compose Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F7F5F2] via-[#F7F5F2] to-transparent pt-10 pb-8 px-4">
        <div className="bg-white rounded-[20px] p-2 pr-2 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E8E4DF]/50">
          <input
            type="text"
            placeholder="Message Isaac..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1A1A1A] placeholder:text-[#888888] px-3"
          />
          <button className="h-[36px] px-4 rounded-full bg-[#E84B2A] text-white flex items-center justify-center shadow-sm hover:bg-[#D64527] transition-colors shrink-0">
            <span className="text-[14px] font-medium mr-1.5">Send</span>
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
