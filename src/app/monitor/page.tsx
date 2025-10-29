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
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const enterFullscreen = () => {
        if (containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error("Gagal masuk mode layar penuh:", err);
                alert("Mode layar penuh gagal. Pastikan browser Anda mengizinkannya.");
            });
        }
    };

    // If a song is playing OR the screen is already in fullscreen mode, show the player.
    if (nowPlaying || isFullscreen) {
        return (
            <div ref={containerRef} className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white">
                <VideoPlayer isMonitor={true} />
            </div>
        );
    }
    
    // Initial state: No song is playing and not in fullscreen. Show the button to enter fullscreen.
    return (
        <div ref={containerRef} className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white p-8">
             <div className="text-center text-muted-foreground">
                <Tv2 size={64} className="mx-auto mb-4" />
                <h1 className="text-4xl font-headline text-white">Layar Monitor Karaoke</h1>
                <p className="mt-2 mb-8">Klik tombol di bawah untuk pengalaman layar penuh yang imersif di TV atau monitor kedua Anda.</p>
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
