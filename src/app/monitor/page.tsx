
"use client";

import { useEffect, useRef, useState } from "react";
import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";

function MonitorPageContent() {
    const { nowPlaying } = useKaraoke();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const enterFullscreen = async () => {
        if (containerRef.current) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.error("Gagal masuk mode layar penuh:", err);
                // Fallback jika gagal, setidaknya kita tandai untuk mulai memutar
                setIsFullscreen(true); 
            }
        }
    };

    // Deteksi jika keluar dari fullscreen (misalnya dengan tombol Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col h-screen w-screen bg-black items-center justify-center">
            {nowPlaying && isFullscreen ? (
                <div className="flex-1 w-full h-full">
                    <VideoPlayer />
                </div>
            ) : (
                <div className="text-center text-white">
                    <h1 className="text-4xl font-headline mb-8">Layar Monitor Karaoke</h1>
                    <Button onClick={enterFullscreen} size="lg" className="h-16 text-2xl px-8">
                        <Expand className="mr-4 h-8 w-8" />
                        Masuk Layar Penuh
                    </Button>
                    <p className="mt-4 text-muted-foreground">Klik untuk memulai pengalaman karaoke di layar penuh.</p>
                </div>
            )}
        </div>
    );
}

export default function MonitorPage() {
    // Kita butuh provider di sini agar MonitorPageContent bisa akses `nowPlaying`
    return (
        <KaraokeProvider>
            <MonitorPageContent />
        </KaraokeProvider>
    );
}
