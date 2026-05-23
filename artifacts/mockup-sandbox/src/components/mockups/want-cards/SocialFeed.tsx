import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MoreHorizontal, Share } from "lucide-react";

export function SocialFeed() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[390px]">
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-3 space-y-0">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border border-gray-100">
                <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">AL</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">Alex</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-4 pt-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">Harley Davidson Sportster</h3>
              <span className="font-bold text-lg text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">$4,000</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              Looking for a clean Sportster, preferably 2010 or newer. Must have clean title and no major issues. Cash in hand, ready to buy this weekend!
            </p>
            
            <div className="mb-4">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 font-normal">
                Motorcycles
              </Badge>
            </div>
            
            <div className="rounded-xl overflow-hidden mb-2">
              <img 
                src="/__mockup/images/sportster.jpg" 
                alt="Reference for Harley Davidson Sportster" 
                className="w-full h-48 object-cover"
              />
            </div>
          </CardContent>
          
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                <MessageCircle className="h-4 w-4 mr-1.5" />
                <span>0 offers</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                <Share className="h-4 w-4 mr-1.5" />
                <span>Share</span>
              </div>
            </div>
            
            <Button className="rounded-full px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              Make Offer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
