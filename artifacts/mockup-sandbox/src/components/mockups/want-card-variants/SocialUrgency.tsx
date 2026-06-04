import React from 'react';
import { MapPin, Eye, Zap, Flame, Clock, MessageCircle, ChevronRight, Activity } from 'lucide-react';

export function SocialUrgency() {
  return (
    <div className="mx-auto max-w-[390px] min-h-screen bg-[#F7F5F2] font-['DM_Sans'] text-[#1A1A1A] pb-20">
      {/* Header */}
      <div className="bg-[#FFF] px-4 py-4 border-b border-[#EBEBEB] sticky top-0 z-20 flex items-center justify-between">
        <h1 className="font-['Syne'] font-bold text-xl tracking-tight">Live Wants</h1>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2ECC71]"></span>
          </span>
          <span className="text-xs font-semibold text-[#2ECC71] uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Card 1: Trending / High Urgency */}
        <div className="bg-[#FFF] rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm">
          {/* Urgency Bar */}
          <div className="bg-gradient-to-r from-[#E84B2A]/10 to-transparent px-4 py-2.5 flex items-center justify-between border-b border-[#E84B2A]/10">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#E84B2A] fill-[#E84B2A]/20 animate-pulse" />
              <span className="text-xs font-semibold text-[#E84B2A]">Trending now</span>
            </div>
            <div className="flex items-center gap-1 text-[#E84B2A] text-xs font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>12 viewing</span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-8 h-8 rounded-full border border-[#EBEBEB]" alt="Alex" />
                <div>
                  <div className="text-sm font-bold">Alex M.</div>
                  <div className="flex items-center gap-1 text-[11px] text-[#888]">
                    <Clock className="w-3 h-3" />
                    <span className="text-[#E84B2A] font-semibold">Posted 4 min ago</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-['Syne'] font-bold text-lg text-[#2ECC71]">$850</div>
                <div className="text-[10px] text-[#888] font-medium uppercase">Budget</div>
              </div>
            </div>

            <h2 className="font-['Syne'] font-bold text-lg mb-1 leading-tight">Mirrorless Digital Camera</h2>
            <p className="text-sm text-[#888] mb-3 line-clamp-2">Looking for a lightly used Sony A6400 or similar with a kit lens. Needed for an upcoming trip this weekend.</p>

            <img src="/__mockup/images/camera.jpg" className="w-full h-40 object-cover rounded-xl mb-4 bg-[#F7F5F2]" alt="Camera" />

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-[#F7F5F2] text-[#1A1A1A] rounded-full">
                <MapPin className="w-3 h-3 text-[#888]" /> 1.2 mi away
              </div>
            </div>

            {/* Seller Activity */}
            <div className="mb-4 bg-[#F7F5F2] rounded-xl p-3 flex items-center justify-between border border-[#EBEBEB]">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border-2 border-[#F7F5F2]" />
                  <img src="https://i.pravatar.cc/150?u=2" className="w-6 h-6 rounded-full border-2 border-[#F7F5F2]" />
                  <img src="https://i.pravatar.cc/150?u=3" className="w-6 h-6 rounded-full border-2 border-[#F7F5F2]" />
                </div>
                <div className="text-xs font-medium text-[#1A1A1A]">
                  <span className="font-bold">3 sellers</span> made offers
                </div>
              </div>
              <Activity className="w-4 h-4 text-[#888]" />
            </div>

            <button className="w-full bg-[#1A1A1A] hover:bg-[#E84B2A] text-white transition-colors py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              Make an Offer <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Fresh Post */}
        <div className="bg-[#FFF] rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm relative">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=b042581f4e29026024d" className="w-8 h-8 rounded-full border border-[#EBEBEB]" alt="Sarah" />
                <div>
                  <div className="text-sm font-bold">Sarah T.</div>
                  <div className="flex items-center gap-1 text-[11px] text-[#888]">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium text-[#2ECC71]">Just now</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-['Syne'] font-bold text-lg text-[#2ECC71]">$200</div>
                <div className="text-[10px] text-[#888] font-medium uppercase">Budget</div>
              </div>
            </div>

            <h2 className="font-['Syne'] font-bold text-lg mb-1 leading-tight">Ergonomic Desk Chair</h2>
            <p className="text-sm text-[#888] mb-3 line-clamp-2">Starting a new WFH job. Need a Herman Miller Aeron or Steelcase Leap. Must be in good condition.</p>
            
            <img src="/__mockup/images/chair.jpg" className="w-full h-40 object-cover rounded-xl mb-4 bg-[#F7F5F2]" alt="Chair" />

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-[#F7F5F2] text-[#1A1A1A] rounded-full">
                <MapPin className="w-3 h-3 text-[#888]" /> 3.5 mi away
              </div>
              <div className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-[#F7F5F2] text-[#1A1A1A] rounded-full border border-[#2ECC71]/30">
                <Zap className="w-3 h-3 text-[#2ECC71]" /> Fast replies
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 text-xs font-medium text-[#888]">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> 2 viewing right now
              </div>
              <span>•</span>
              <div>Be the first to offer!</div>
            </div>

            <button className="w-full bg-[#1A1A1A] hover:bg-[#E84B2A] text-white transition-colors py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              Make an Offer <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 3: Active Negotiations */}
        <div className="bg-[#FFF] rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=c042581f4e29026024d" className="w-8 h-8 rounded-full border border-[#EBEBEB]" alt="Mike" />
                <div>
                  <div className="text-sm font-bold">Mike R.</div>
                  <div className="flex items-center gap-1 text-[11px] text-[#888]">
                    <Clock className="w-3 h-3" />
                    <span>Posted 2 hrs ago</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-['Syne'] font-bold text-lg text-[#2ECC71]">$150</div>
                <div className="text-[10px] text-[#888] font-medium uppercase">Budget</div>
              </div>
            </div>

            <h2 className="font-['Syne'] font-bold text-lg mb-1 leading-tight">Acoustic Guitar for Beginner</h2>
            <p className="text-sm text-[#888] mb-3 line-clamp-2">Looking for a Yamaha FG800 or similar. Needs to be playable, minor scratches are fine.</p>

            <img src="/__mockup/images/guitar.jpg" className="w-full h-40 object-cover rounded-xl mb-4 bg-[#F7F5F2]" alt="Guitar" />

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-[#F7F5F2] text-[#1A1A1A] rounded-full">
                <MapPin className="w-3 h-3 text-[#888]" /> 0.8 mi away
              </div>
            </div>

            <div className="mb-4 bg-[#F7F5F2] rounded-xl p-3 flex flex-col gap-2 border border-[#EBEBEB]">
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/150?u=4" className="w-6 h-6 rounded-full border-2 border-[#F7F5F2]" />
                  <img src="https://i.pravatar.cc/150?u=5" className="w-6 h-6 rounded-full border-2 border-[#F7F5F2]" />
                  <div className="w-6 h-6 rounded-full border-2 border-[#F7F5F2] bg-[#EBEBEB] flex items-center justify-center text-[10px] font-bold">+3</div>
                </div>
                <div className="text-xs font-semibold text-[#1A1A1A]">5 total offers</div>
              </div>
              <div className="text-[11px] text-[#888] flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> Poster is actively reviewing offers
              </div>
            </div>

            <button className="w-full bg-white border border-[#EBEBEB] hover:border-[#1A1A1A] text-[#1A1A1A] transition-colors py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              View Offers & Compete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
