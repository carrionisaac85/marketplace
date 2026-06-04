import React, { useState } from 'react';
import { Home, List, MessageCircle, User } from 'lucide-react';

export default function ExpandingLabel() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wants', label: 'My Wants', icon: List },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="max-w-[390px] mx-auto h-[240px] overflow-hidden bg-white relative font-['DM_Sans',sans-serif]">
      {/* Simulated Content */}
      <div className="p-4 space-y-4 pt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-24 bg-[#F7F5F2] rounded-full animate-pulse" />
          <div className="h-10 w-10 bg-[#F7F5F2] rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <div className="h-24 bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-[#F7F5F2] rounded-xl" />
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-4 w-3/4 bg-[#EBEBEB] rounded" />
                <div className="h-3 w-1/2 bg-[#F7F5F2] rounded" />
              </div>
            </div>
          </div>
          
          <div className="h-24 bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-sm">
             <div className="flex gap-3">
              <div className="h-12 w-12 bg-[#F7F5F2] rounded-xl" />
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-4 w-5/6 bg-[#EBEBEB] rounded" />
                <div className="h-3 w-1/3 bg-[#F7F5F2] rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar Container */}
      <div className="absolute bottom-0 left-0 right-0 h-[84px] bg-white border-t border-[#EBEBEB] px-4 pb-6 pt-3 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center justify-center transition-all duration-300 ease-out outline-none"
              style={{ flex: isActive ? '1 1 auto' : '0 1 auto' }}
            >
              <div
                className={`flex items-center justify-center h-12 transition-all duration-300 ease-out overflow-hidden ${
                  isActive ? 'bg-[#E84B2A] rounded-full px-5 shadow-sm' : 'bg-transparent px-3'
                }`}
              >
                <Icon 
                  size={isActive ? 20 : 24} 
                  strokeWidth={2.5}
                  className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#888888]'}`} 
                />
                
                <div 
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out flex items-center ${
                    isActive ? 'max-w-[100px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
                  }`}
                >
                  <span className="text-white font-semibold text-sm font-['Syne',sans-serif] tracking-wide mt-[2px]">
                    {tab.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
