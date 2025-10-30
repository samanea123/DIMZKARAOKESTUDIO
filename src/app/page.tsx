
"use client";

import AppLayout from "@/components/karaoke/AppLayout";
import Favorites from "@/components/karaoke/Favorites";
import Header from "@/components/karaoke/Header";
import History from "@/components/karaoke/History";
import SongQueue from "@/components/karaoke/SongQueue";
import SongSearch from "@/components/karaoke/SongSearch";
import TopHits from "@/components/karaoke/TopHits";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";
import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { Separator } from "@/components/ui/separator";
import Script from "next/script";
import { SidebarTrigger } from "@/components/ui/sidebar";

function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-2 sticky top-0 bg-background z-10 border-b">
        <SidebarTrigger />
        <h1 className="font-headline text-2xl font-bold text-white tracking-wider">
          DIMZ KARAOKE
        </h1>
        <div className="w-8"></div>
    </div>
  )
}


function KaraokeContent() {
  const { activeTab } = useKaraoke();

  return (
    <div className="flex h-screen bg-background">
      <AppLayout>
        <MobileHeader />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 md:p-6 lg:p-8">
              <Header />
              <SongSearch />
              <Separator />
              <TopHits />
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[400px]">
                <div className="flex flex-col">
                   <h2 className="text-xl font-headline font-semibold text-primary mb-2">Layar Monitor</h2>
                  <div className="flex-1 rounded-lg overflow-hidden border">
                    <VideoPlayer />
                  </div>
                </div>
                <div className="flex flex-col">
                    <SongQueue />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
              <History />
            </div>
          )}
          {activeTab === 'favorites' && (
            <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
             <Favorites />
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  );
}


export default function Home() {
  return (
    <KaraokeProvider>
       <Script
        src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
        strategy="lazyOnload"
      />
      <KaraokeContent />
    </KaraokeProvider>
  );
}
