import React from "react";
import { Heart, MapPin, Tag, MessageCircle, MoreHorizontal, Share, ChevronLeft } from "lucide-react";

export function DesireForward() {
  const wants = [
    {
      id: "1",
      title: "A 70s Togo Sofa in warm tones",
      description: "Looking for an authentic Ligne Roset Togo in mustard, rust, or deep brown. Doesn't need to be perfect, I love a little patina.",
      budget: "$1,200 - $1,500",
      category: "Furniture",
      location: "Brooklyn, NY",
      distance: "2 mi",
      timestamp: "2h ago",
      poster: {
        name: "Sarah Jenkins",
        avatar: "SJ",
      },
      image: "/__mockup/images/vintage-couch.png",
      offers: 3,
    },
    {
      id: "2",
      title: "Worn-in Moto Leather Jacket",
      description: "Searching for a heavy-duty motorcycle jacket. Black or dark brown leather, size medium. The more perfectly worn in, the better.",
      budget: "Up to $300",
      category: "Clothing",
      location: "East Village, NY",
      distance: "1.5 mi",
      timestamp: "5h ago",
      poster: {
        name: "Mike T.",
        avatar: "MT",
      },
      image: "/__mockup/images/leather-jacket.jpg",
      offers: 1,
    },
    {
      id: "3",
      title: "Harley Sportster for a custom build",
      description: "Need a solid base for a scrambler project. Pre-2003 preferred (Evo engine). Cosmetic damage is totally fine, just needs a good frame.",
      budget: "$4,500 max",
      category: "Vehicles",
      location: "Queens, NY",
      distance: "4 mi",
      timestamp: "1d ago",
      poster: {
        name: "Alex R.",
        avatar: "AR",
      },
      image: "/__mockup/images/sportster.jpg",
      offers: 7,
    }
  ];

  return (
    <div className="bg-[#F7F5F2] min-h-screen max-w-[390px] mx-auto overflow-hidden relative font-['DM_Sans',sans-serif] text-[#1A1A1A]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 py-4 flex items-center justify-between border-b border-[#EBEBEB]">
        <div className="flex items-center gap-3">
          <ChevronLeft className="w-6 h-6" />
          <h1 className="text-xl font-bold font-['Syne',sans-serif]">Feed</h1>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-black">For You</span>
          <span className="text-[#888]">Following</span>
        </div>
      </div>

      {/* Feed */}
      <div className="pb-24">
        {wants.map((want) => (
          <div key={want.id} className="mb-6 bg-white border-b border-[#EBEBEB] pb-6">
            {/* Full width hero image */}
            <div className="w-full aspect-[4/5] bg-gray-100 relative mb-5">
              <img 
                src={want.image} 
                alt={want.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="w-5 h-5 text-[#1A1A1A]" />
                </button>
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-200 to-amber-200 flex items-center justify-center text-[10px] font-bold">
                  {want.poster.avatar}
                </div>
                <span className="text-xs font-semibold">{want.poster.name}</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 space-y-4">
              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs text-[#888] font-medium tracking-wide uppercase">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {want.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {want.distance}</span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-[22px] leading-tight font-['Syne',sans-serif] font-bold mb-3">
                  "{want.title}"
                </h2>
                <p className="text-[15px] leading-relaxed text-[#555]">
                  {want.description}
                </p>
              </div>

              {/* Budget & Offers row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-[#888] font-medium mb-0.5">Willing to pay</span>
                  <span className="text-lg font-bold text-[#2ECC71]">{want.budget}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[#888] font-medium mb-0.5">Offers</span>
                  <span className="text-sm font-semibold">{want.offers} pending</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center gap-3">
                <button className="flex-1 bg-[#E84B2A] text-white rounded-full py-3.5 px-4 font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]">
                  <MessageCircle className="w-5 h-5" />
                  I have this
                </button>
                <button className="w-12 h-12 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[#1A1A1A] transition-colors active:bg-gray-50">
                  <Share className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[#1A1A1A] transition-colors active:bg-gray-50">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
