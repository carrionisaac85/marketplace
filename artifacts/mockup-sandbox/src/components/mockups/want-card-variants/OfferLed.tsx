import React from "react";

export function OfferLed() {
  const wants = [
    {
      id: "w1",
      budget: "$850",
      title: "Mint Condition Herman Miller Aeron",
      description: "Size B, fully loaded. Must have posture fit SL. Willing to pick up anywhere within 30 miles.",
      category: "Furniture",
      distance: "12 mi",
      timestamp: "2h ago",
      posterName: "David K.",
      posterInitials: "DK",
      offers: 2,
    },
    {
      id: "w2",
      budget: "$1,200",
      title: "MacBook Pro M1 14\"",
      description: "Looking for base model (16GB RAM, 512GB SSD) in space gray. Need it by this weekend for a trip.",
      category: "Electronics",
      distance: "4 mi",
      timestamp: "5h ago",
      posterName: "Sarah M.",
      posterInitials: "SM",
      offers: 5,
    },
    {
      id: "w3",
      budget: "$300",
      title: "Callaway Golf Club Set (Left Handed)",
      description: "Just starting out, looking for a decent complete set. Driver, irons, putter, and bag. Doesn't need to be newest model.",
      category: "Sports",
      distance: "8 mi",
      timestamp: "1d ago",
      posterName: "Mike T.",
      posterInitials: "MT",
      offers: 0,
    }
  ];

  return (
    <div className="bg-[#F7F5F2] min-h-screen max-w-[390px] mx-auto overflow-y-auto pb-8 font-['DM_Sans'] text-[#1A1A1A]">
      {/* Header */}
      <div className="bg-white px-4 py-6 sticky top-0 z-10 border-b border-[#EBEBEB]">
        <h1 className="font-['Syne'] text-2xl font-bold">Opportunities</h1>
        <p className="text-[#888] text-sm mt-1">Found 42 buyers looking for items near you.</p>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          <span className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">All Categories</span>
          <span className="bg-[#F7F5F2] text-[#1A1A1A] px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">Electronics</span>
          <span className="bg-[#F7F5F2] text-[#1A1A1A] px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">Furniture</span>
          <span className="bg-[#F7F5F2] text-[#1A1A1A] px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">Auto</span>
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 flex flex-col gap-4">
        {wants.map((want) => (
          <div key={want.id} className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm">
            {/* Top row: Price and Actions */}
            <div className="p-5 border-b border-[#EBEBEB] flex justify-between items-start bg-[#FAFAFA]">
              <div>
                <span className="text-[#888] text-xs font-semibold tracking-wider uppercase mb-1 block">Budget</span>
                <div className="font-['Syne'] text-4xl font-extrabold text-[#2ECC71] tracking-tight">{want.budget}</div>
              </div>
              <button className="text-[#888] hover:text-[#1A1A1A] p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#F7F5F2] text-[#1A1A1A] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{want.category}</span>
                <span className="text-[#888] text-xs flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {want.distance}
                </span>
              </div>
              
              <h2 className="font-['Syne'] text-xl font-bold mb-2 leading-tight">{want.title}</h2>
              <p className="text-[#888] text-sm line-clamp-2 leading-relaxed mb-4">{want.description}</p>
              
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#EBEBEB]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E84B2A] text-white flex items-center justify-center text-xs font-bold">
                    {want.posterInitials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{want.posterName}</div>
                    <div className="text-xs text-[#888]">{want.timestamp} • {want.offers} offers</div>
                  </div>
                </div>
              </div>

              {/* Huge CTA */}
              <button className="w-full mt-5 bg-[#E84B2A] text-white font-bold py-3.5 rounded-xl text-center active:scale-[0.98] transition-transform">
                Make Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
