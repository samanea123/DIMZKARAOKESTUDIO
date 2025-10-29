
"use client";

import { useEffect, useRef, useState } from "react";
import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";
import { Tv2, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

function MonitorPageContent() {
    const { nowPlaying } = useKaraoke();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Set initial state
        setIsFullscreen(!!document.fullscreenElement);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const enterFullscreen = () => {
        if (containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error("Gagal masuk mode layar penuh:", err);
            });
        }
    };
    
    // If it's already fullscreen OR a song is playing, show the player.
    // This handles cases where the user enters fullscreen first, or a song starts playing.
    if (isFullscreen || nowPlaying) {
        return (
            <div ref={containerRef} className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white">
                <VideoPlayer />
            </div>
        );
    }
    
    // Initial state: not fullscreen and no song is playing. Show the button.
    return (
        <div ref={containerRef} className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white">
             <div className="text-center text-muted-foreground p-8">
                <Tv2 size={64} className="mx-auto mb-4" />
                <h1 className="text-4xl font-headline text-white">Layar Monitor Karaoke</h1>
                <p className="mt-2 mb-8">Klik untuk memulai pengalaman layar penuh.</p>
                <Button onClick={enterFullscreen} size="lg" className="text-lg">
                    <Expand className="mr-2" />
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
