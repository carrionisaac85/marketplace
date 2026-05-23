import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, MessageSquare, ArrowRight } from "lucide-react";

export function OfferLed() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans text-slate-900">
      <div className="w-full max-w-[390px] rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        
        {/* Top: Price and Category */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Paying up to</p>
            <p className="text-4xl font-black tracking-tight text-emerald-600">
              $600
            </p>
          </div>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
            Furniture
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="mb-5">
          <h2 className="mb-2 text-xl font-bold leading-tight text-slate-900">
            Looking for a vintage leather couch
          </h2>
          <p className="text-base text-slate-600 leading-snug">
            Looking for a 3-seater vintage leather couch, ideally mid-century modern style. Minor wear and tear is totally fine.
          </p>
        </div>

        {/* Poster & Meta info */}
        <div className="mb-6 flex items-center justify-between border-y border-slate-100 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="Isaac" />
              <AvatarFallback className="bg-slate-900 text-white text-xs font-medium">I</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Isaac</span>
              <div className="flex items-center text-xs text-slate-500">
                <Clock className="mr-1 h-3 w-3" />
                13m ago
              </div>
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            1 offer active
          </div>
        </div>

        {/* Primary Action */}
        <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-base font-bold shadow-md transition-transform active:scale-[0.98]">
          Make an Offer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
