
"use client";

import SongQueue from "@/components/karaoke/SongQueue";
import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider } from "@/context/KaraokeContext";

function MonitorPageContent() {
    return (
        <div className="flex flex-col h-screen bg-black">
            <div className="flex-1">
                <VideoPlayer />
            </div>
            <div className="h-1/3 max-h-[300px] border-t border-border">
                <SongQueue />
            </div>
        </div>
    );
}

export default function MonitorPage() {
    return (
        <KaraokeProvider>
            <MonitorPageContent />
        </KaraokeProvider>
    )
}
