import React from "react";
import { MessageCircle, Clock, ChevronLeft } from "lucide-react";

export function WarmMarketplace() {
  const groups = [
    {
      id: "g1",
      wantTitle: "Vintage Leather Sofa",
      sellerName: "María J.",
      offers: [
        {
          id: "o1",
          price: 320,
          status: "Accepted",
          message: "",
          timestamp: "2 hours ago",
        },
        {
          id: "o2",
          price: 280,
          status: "Declined",
          message: "",
          timestamp: "Yesterday",
        },
      ],
    },
    {
      id: "g2",
      wantTitle: "Mountain Bike",
      sellerName: "Tom K.",
      offers: [
        {
          id: "o3",
          price: 150,
          status: "Pending",
          message: "Would you take $150? It needs new tires.",
          timestamp: "Just now",
        },
      ],
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100 p-4 font-sans">
      <div 
        className="bg-[#fdfaf6] relative overflow-hidden shadow-2xl rounded-[2.5rem] border-[6px] border-stone-200"
        style={{ width: 390, minHeight: 844 }}
      >
        {/* Header */}
        <div className="pt-14 pb-4 px-6 bg-[#f7efe6] border-b border-[#e8dccb] flex items-center sticky top-0 z-10">
          <button className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors text-amber-900">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-medium text-amber-950 ml-2">Offers Sent</h1>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto pb-24 h-[calc(100%-88px)]">
          {groups.map((group) => (
            <div key={group.id} className="space-y-3">
              {/* Group Header */}
              <div className="bg-[#f9f2ea] rounded-xl p-4 shadow-sm border border-[#f0e3d2]">
                <h2 className="text-lg font-semibold text-amber-900">{group.wantTitle}</h2>
                <p className="text-sm text-amber-700/80 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Seller: {group.sellerName}
                </p>
              </div>

              {/* Offers */}
              <div className="space-y-3 pl-2">
                {group.offers.map((offer) => {
                  // Determine status styles
                  let statusColor = "bg-stone-300";
                  let statusText = "text-stone-600";
                  let borderColor = "border-l-stone-300";
                  let lightBg = "bg-stone-50";

                  if (offer.status === "Accepted") {
                    statusColor = "bg-[#4ade80]";
                    statusText = "text-[#166534]";
                    borderColor = "border-l-[#4ade80]";
                    lightBg = "bg-[#f0fdf4]";
                  } else if (offer.status === "Declined") {
                    statusColor = "bg-[#f87171]";
                    statusText = "text-[#991b1b]";
                    borderColor = "border-l-[#f87171]";
                    lightBg = "bg-[#fef2f2]";
                  } else if (offer.status === "Pending") {
                    statusColor = "bg-[#fbbf24]";
                    statusText = "text-[#b45309]";
                    borderColor = "border-l-[#fbbf24]";
                    lightBg = "bg-[#fffbeb]";
                  }

                  return (
                    <div 
                      key={offer.id} 
                      className={`bg-white rounded-r-xl rounded-l-sm border border-stone-100 shadow-sm border-l-4 ${borderColor} p-4 flex flex-col gap-3 relative`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-2xl font-medium text-stone-800">${offer.price}</div>
                          <div className={`text-xs font-medium uppercase tracking-wider mt-1 ${statusText}`}>
                            {offer.status}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-stone-400 gap-1 mt-1">
                          <Clock size={12} />
                          {offer.timestamp}
                        </div>
                      </div>

                      {offer.message && (
                        <div className={`p-3 rounded-lg text-sm text-stone-600 italic ${lightBg}`}>
                          "{offer.message}"
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#f4e9de] hover:bg-[#ebdccc] text-amber-900 rounded-full text-sm font-medium transition-colors">
                          <MessageCircle size={16} />
                          Message
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
