
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
import CastButton from "@/components/karaoke/CastButton";

function KaraokeContent() {
  const { activeTab } = useKaraoke();

  return (
    <div className="flex h-screen bg-background">
      <AppLayout>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 md:p-6 lg:p-8">
              <Header />
              <SongSearch />
              <Separator />
              <TopHits />
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[400px]">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-headline font-semibold text-primary">Layar Monitor</h2>
                    <CastButton />
                  </div>
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
      <KaraokeContent />
    </KaraokeProvider>
  );
}
