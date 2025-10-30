"use client";

import Header from "@/components/karaoke/Header";
import SongQueue from "@/components/karaoke/SongQueue";
import SongSearch from "@/components/karaoke/SongSearch";
import TopHits from "@/components/karaoke/TopHits";
import { KaraokeProvider } from "@/context/KaraokeContext";
import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { Separator } from "@/components/ui/separator";

function HomePageContent() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
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
    </div>
  );
}

export default function Home() {
  return (
    <KaraokeProvider>
      <HomePageContent />
    </KaraokeProvider>
  );
}
