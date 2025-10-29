"use client";

import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";
import { Tv2 } from "lucide-react";

function MonitorPageContent() {
    const { nowPlaying } = useKaraoke();

    // The VideoPlayer component will now handle the fullscreen logic internally when isMonitor is true.
    // We just need to render it.
    if (nowPlaying) {
        return (
            <div className="h-screen w-screen bg-black">
                <VideoPlayer isMonitor={true} />
            </div>
        );
    }
    
    // Display a waiting message if no song is playing.
    return (
        <div className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white p-8">
             <div className="text-center text-muted-foreground">
                <Tv2 size={64} className="mx-auto mb-4 animate-pulse" />
                <h1 className="text-4xl font-headline text-white">Layar Monitor Karaoke</h1>
                <p className="mt-2 mb-8">Menunggu lagu untuk diputar...</p>
            </div>
        </div>
    );
}

export default function MonitorPage() {
    return (
        <KaraokeProvider>
            <MonitorPageContent />
        </KaraokeProvider>
    );
}
