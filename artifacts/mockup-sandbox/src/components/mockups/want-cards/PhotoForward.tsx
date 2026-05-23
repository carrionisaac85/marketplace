import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Clock, MoreHorizontal, MessageSquare } from 'lucide-react';

export function PhotoForward() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 font-sans">
      <div className="w-full max-w-[390px] bg-white overflow-hidden shadow-sm sm:rounded-[2rem] rounded-none relative border border-zinc-200">
        
        <div className="relative aspect-[4/3] w-full bg-zinc-200">
          <img 
            src="/__mockup/images/vintage-couch.png" 
            alt="Vintage leather couch" 
            className="object-cover w-full h-full"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-black/60 text-white hover:bg-black/60 border-none backdrop-blur-md px-2.5 py-1 text-xs font-medium">
              Furniture
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
             <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 hover:text-white rounded-full backdrop-blur-md">
                <MoreHorizontal className="h-4 w-4" />
             </Button>
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
            <div className="flex justify-between items-end gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold leading-tight text-white mb-1 shadow-sm">Vintage leather couch</h2>
                <p className="text-zinc-300 text-xs font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Portland, OR
                </p>
              </div>
              <div className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                $600
              </div>
            </div>
          </div>
        </div>

        {/* Details & Actions */}
        <div className="p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-zinc-100">
                <AvatarFallback className="bg-zinc-100 text-zinc-700 text-sm font-semibold">JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 leading-none">Jane Doe</span>
                <span className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" /> 2h ago
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-600 leading-relaxed">
            Looking for a mid-century or vintage leather couch. Ideally 3-seater, brown or tan leather. Normal wear and tear is totally fine, just nothing with major tears. Can pick up this weekend!
          </p>

          <div className="pt-4 flex items-center gap-4 border-t border-zinc-100">
            <Button className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-12 text-sm font-semibold shadow-sm transition-all active:scale-[0.98]">
              Offer item
            </Button>
            <div className="flex flex-col items-center justify-center px-2 min-w-[60px]">
              <span className="text-lg font-bold text-zinc-900 leading-none mb-0.5">1</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Offer</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
