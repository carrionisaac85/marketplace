import React from "react";
import { ArrowRight, ChevronRight, MessageSquare, Clock, XCircle, CheckCircle2, MoreHorizontal } from "lucide-react";

export function DarkCommand() {
  return (
    <div className="flex items-center justify-center min-h-screen font-mono" style={{ background: "#0a0c10" }}>
      <div 
        className="relative overflow-hidden text-slate-300"
        style={{ 
          width: 390, 
          minHeight: 844, 
          background: "#0f1117",
          boxShadow: "0 0 40px rgba(0,0,0,0.8)"
        }}
      >
        {/* Header */}
        <div className="px-5 py-6 border-b border-slate-800/80 bg-[#0f1117]/90 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Active Offers</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Terminal view</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400">
            <MoreHorizontal size={16} />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Group 1 */}
          <div className="space-y-3">
            {/* Header Panel */}
            <div className="px-4 py-3 bg-[#0a0c10] border border-slate-800 rounded-lg flex justify-between items-center shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <div>
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Want</div>
                <div className="text-sm font-semibold text-slate-200">Vintage Leather Sofa</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Seller</div>
                <div className="text-sm text-slate-400">María J.</div>
              </div>
            </div>

            {/* Offers */}
            <div className="pl-2 space-y-3 relative border-l-2 border-slate-800 ml-2">
              {/* Offer 1 - Accepted */}
              <div className="relative pl-6 py-2">
                <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
                
                <div className="bg-[#141720] border border-slate-800 rounded-lg p-4 transition-all hover:border-[#39ff14]/30">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-2xl font-bold text-[#39ff14] tracking-tight drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">
                      $320
                    </div>
                    <div className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/20">
                      Accepted
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock size={12} className="mr-1.5" />
                      Today, 14:32
                    </div>
                    <button className="flex items-center text-xs font-semibold text-[#39ff14] hover:text-[#39ff14]/80 transition-colors group">
                      OPEN CHAT
                      <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Offer 2 - Declined */}
              <div className="relative pl-6 py-2">
                <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-[#ff3333] shadow-[0_0_8px_#ff3333]" />
                
                <div className="bg-[#141720] border border-slate-800 rounded-lg p-4 opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xl font-bold text-slate-400 line-through decoration-[#ff3333]/50 tracking-tight">
                      $280
                    </div>
                    <div className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-[#ff3333]/10 text-[#ff3333] border border-[#ff3333]/20">
                      Declined
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock size={12} className="mr-1.5" />
                      Yesterday, 09:15
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2 */}
          <div className="space-y-3 pt-4">
            {/* Header Panel */}
            <div className="px-4 py-3 bg-[#0a0c10] border border-slate-800 rounded-lg flex justify-between items-center shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <div>
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Want</div>
                <div className="text-sm font-semibold text-slate-200">Mountain Bike</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Seller</div>
                <div className="text-sm text-slate-400">Tom K.</div>
              </div>
            </div>

            {/* Offers */}
            <div className="pl-2 space-y-3 relative border-l-2 border-slate-800 ml-2">
              {/* Offer 1 - Pending */}
              <div className="relative pl-6 py-2">
                <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-[#ffaa00] shadow-[0_0_8px_#ffaa00]" />
                
                <div className="bg-[#141720] border border-slate-800 rounded-lg p-4 transition-all hover:border-[#ffaa00]/30">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-2xl font-bold text-[#ffaa00] tracking-tight drop-shadow-[0_0_8px_rgba(255,170,0,0.3)]">
                      $150
                    </div>
                    <div className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/20 animate-pulse">
                      Pending
                    </div>
                  </div>

                  <div className="bg-[#0a0c10] border border-slate-800/80 rounded p-3 mb-4 mt-2 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 rounded-l" />
                    <p className="text-xs text-slate-400 pl-2 italic">
                      "Would you take $150? It needs new tires."
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock size={12} className="mr-1.5" />
                      Oct 12, 18:40
                    </div>
                    <button className="flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                      WITHDRAW
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
