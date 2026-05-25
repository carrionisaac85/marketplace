import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';

export function MinimalEditorial() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 font-sans">
      <div style={{ width: 390, minHeight: 844, background: "#fff", position: 'relative', overflow: 'hidden' }} className="shadow-sm border border-neutral-200 flex flex-col">
        {/* Header */}
        <header className="px-6 py-6 border-b border-neutral-100 flex items-center gap-4">
          <button className="text-neutral-900 -ml-2 p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium tracking-tight text-neutral-900">Offers Sent</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-12">
          {/* Group 1 */}
          <div className="mb-10">
            <div className="px-6 pt-8 pb-3 border-b border-neutral-100">
              <h2 className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                Vintage Leather Sofa · María J.
              </h2>
            </div>
            
            <div className="flex flex-col">
              {/* Offer 1 */}
              <div className="px-6 py-6 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-light tracking-tight text-neutral-900">$320</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-medium text-neutral-900">Accepted</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <span className="text-xs text-neutral-400">Oct 24, 2:15 PM</span>
                  <button className="text-sm font-medium text-neutral-900 hover:text-neutral-600 flex items-center gap-1 group transition-colors">
                    View conversation <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Offer 2 */}
              <div className="px-6 py-6 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-light tracking-tight text-neutral-400 line-through decoration-1">$280</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span className="text-sm font-medium text-neutral-500">Declined</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <span className="text-xs text-neutral-400">Oct 23, 11:30 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2 */}
          <div className="mb-10">
            <div className="px-6 pt-4 pb-3 border-b border-neutral-100">
              <h2 className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                Mountain Bike · Tom K.
              </h2>
            </div>
            
            <div className="flex flex-col">
              {/* Offer 1 */}
              <div className="px-6 py-6 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-light tracking-tight text-neutral-900">$150</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                    <span className="text-sm font-medium text-neutral-600">Pending</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-[15px] leading-relaxed text-neutral-600 border-l-2 border-neutral-200 pl-4 py-1 italic">
                    "Would you take $150? It needs new tires."
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Today, 9:42 AM</span>
                  <button className="text-sm font-medium text-neutral-900 hover:text-neutral-600 flex items-center gap-1 group transition-colors">
                    View conversation <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
