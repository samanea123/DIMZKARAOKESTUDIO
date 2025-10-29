"use client";

import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";
import { Maximize, Tv2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function MonitorPageContent() {
    const { nowPlaying } = useKaraoke();

    const handleEnterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
    };

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
                <Tv2 size={64} className="mx-auto mb-4" />
                <h1 className="text-4xl font-headline text-white">Layar Monitor Karaoke</h1>
                <p className="mt-2 mb-8">Menunggu lagu untuk diputar...</p>
                 <Button onClick={handleEnterFullscreen} size="lg">
                    <Maximize className="mr-2" />
                    Masuk Layar Penuh
                </Button>
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
