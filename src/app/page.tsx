
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

function KaraokeContent() {
  const { activeTab } = useKaraoke();

  return (
    <div className="flex h-screen bg-background">
      <AppLayout>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
            {activeTab === 'home' && (
              <>
                <Header />
                <SongSearch />
                <Separator />
                <TopHits />
              </>
            )}
            {activeTab === 'history' && <History />}
            {activeTab === 'favorites' && <Favorites />}
          </div>
        </div>
        <aside className="hidden xl:flex flex-col w-[350px] border-l bg-card h-full">
            <div className="h-1/2 flex flex-col">
                <VideoPlayer />
            </div>
            <div className="h-1/2 flex flex-col border-t">
                <SongQueue />
            </div>
        </aside>
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
