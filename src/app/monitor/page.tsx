
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
        // Set initial state
        setIsFullscreen(!!document.fullscreenElement);

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
            });
        }
    };

    // Kondisi 1: Tampilkan VideoPlayer jika sudah fullscreen ATAU ada lagu yang sedang diputar.
    if (isFullscreen || nowPlaying) {
        return (
            <div ref={containerRef} className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white">
                <VideoPlayer />
            </div>
        );
    }
    
    // Kondisi 2: Tampilan awal jika belum fullscreen dan tidak ada lagu yang diputar.
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
