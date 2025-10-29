
"use client";

import AppLayout from "@/components/karaoke/AppLayout";
import Favorites from "@/components/karaoke/Favorites";
import Header from "@/components/karaoke/Header";
import History from "@/components/karaoke/History";
import MiniMonitor from "@/components/karaoke/MiniMonitor";
import SongQueue from "@/components/karaoke/SongQueue";
import SongSearch from "@/components/karaoke/SongSearch";
import TopHits from "@/components/karaoke/TopHits";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";

function KaraokeContent() {
  const { activeTab } = useKaraoke();

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-4 md:p-8 gap-8 overflow-auto">
        <Header />

        {activeTab === 'home' && (
          <>
            <SongSearch />
            <TopHits />
          </>
        )}

        {activeTab === 'history' && <History />}
        
        {activeTab === 'favorites' && <Favorites />}


        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 flex-1 min-h-0">
          <div className="xl:col-span-3 h-full min-h-[300px] xl:min-h-0">
            <MiniMonitor />
          </div>
          <div className="xl:col-span-2 h-full min-h-[300px] xl:min-h-0">
            <SongQueue />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Home() {
  return (
    <KaraokeProvider>
      <KaraokeContent />
    </KaraokeProvider>
  );
}
