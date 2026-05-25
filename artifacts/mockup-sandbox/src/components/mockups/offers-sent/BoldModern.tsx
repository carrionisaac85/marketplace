import React from "react";
import { MessageCircle, Clock } from "lucide-react";

export function BoldModern() {
  const groups = [
    {
      wantTitle: "Vintage Leather Sofa",
      sellerName: "María J.",
      offers: [
        {
          id: "1",
          price: 320,
          status: "Accepted",
          timestamp: "2h ago",
        },
        {
          id: "2",
          price: 280,
          status: "Declined",
          timestamp: "1d ago",
        },
      ],
    },
    {
      wantTitle: "Mountain Bike",
      sellerName: "Tom K.",
      offers: [
        {
          id: "3",
          price: 150,
          status: "Pending",
          message: "Would you take $150? It needs new tires.",
          timestamp: "Just now",
        },
      ],
    },
  ];

  return (
    <div
      className="flex items-center justify-center min-h-screen font-sans"
      style={{ background: "#f5f5f7" }}
    >
      <div
        style={{
          width: 390,
          minHeight: 844,
          background: "#f5f5f7",
          boxShadow: "0 0 20px rgba(0,0,0,0.05)",
        }}
        className="relative flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white px-6 pt-14 pb-4 sticky top-0 z-10 shadow-sm border-b border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Offers Sent
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
          {groups.map((group, i) => (
            <div key={i} className="space-y-4">
              {/* Group Header */}
              <div className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {group.sellerName}
                </h2>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {group.wantTitle}
                </h3>
              </div>

              {/* Offer Cards */}
              <div className="space-y-3">
                {group.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black tracking-tighter text-gray-900">
                          ${offer.price}
                        </span>
                        <div className="flex items-center text-xs text-gray-400 mt-1 font-medium">
                          <Clock className="w-3 h-3 mr-1" />
                          {offer.timestamp}
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${
                          offer.status === "Accepted"
                            ? "bg-[#e8faed] text-[#12a14b]"
                            : offer.status === "Declined"
                            ? "bg-[#feeced] text-[#e02433]"
                            : "bg-[#eef2ff] text-[#4f46e5]"
                        }
                      `}
                      >
                        {offer.status}
                      </div>
                    </div>

                    {offer.message && (
                      <div className="bg-[#f5f5f7] rounded-xl p-3 text-sm text-gray-600 font-medium italic border border-gray-100">
                        "{offer.message}"
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button className="bg-indigo-600 text-white rounded-full px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
