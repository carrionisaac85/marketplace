import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MarketplaceListing() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[390px]">
        {/* The Card */}
        <Card className="overflow-hidden border-gray-200 rounded-xl shadow-sm bg-white">
          <div className="flex p-3 gap-3">
            {/* Left: Thumbnail */}
            <div className="w-[100px] h-[100px] shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
              <img
                src="/__mockup/images/leather-jacket.jpg"
                alt="Vintage leather jacket"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1">
                <span>1/2</span>
              </div>
            </div>

            {/* Right: Info Stack */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    Vintage brown leather motorcycle jacket
                  </h3>
                  <span className="font-bold text-green-700 text-sm ml-2 shrink-0">
                    $150
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                  Looking for an original 80s moto jacket, size L. Good condition.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border-none rounded-sm">
                    Fashion
                  </Badge>
                  <div className="flex items-center text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-sm">
                    <MapPin className="w-3 h-3 mr-0.5" />
                    Seattle, WA
                  </div>
                </div>
              </div>

              {/* Poster info & Action */}
              <div className="flex items-center justify-between mt-auto pt-1">
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-4 h-4">
                    <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">JD</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-gray-500 font-medium truncate max-w-[80px]">
                    John D.
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-0.5" />
                    2h
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50/80 px-3 py-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>5 offers</span>
            </div>
            <Button size="sm" className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              Make Offer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
