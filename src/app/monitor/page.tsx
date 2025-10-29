
"use client";

import { useEffect, useRef, useState } from "react";
import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";
import { Tv2 } from "lucide-react";

function MonitorPageContent() {
    const { nowPlaying } = useKaraoke();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Coba masuk ke fullscreen secara otomatis.
        // Ini mungkin diblokir oleh browser, tergantung pada pengaturannya.
        if (containerRef.current && document.fullscreenEnabled) {
            containerRef.current.requestFullscreen().catch(err => {
                console.warn("Gagal masuk mode layar penuh secara otomatis:", err);
            });
        }

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                // Bisa tambahkan logika jika keluar dari fullscreen,
                // tapi untuk sekarang kita biarkan saja.
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white">
            {nowPlaying ? (
                <div className="flex-1 w-full h-full">
                    <VideoPlayer />
                </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    <Tv2 size={64} className="mx-auto mb-4" />
                    <h1 className="text-4xl font-headline text-white">Layar Monitor Karaoke</h1>
                    <p className="mt-2">Menunggu lagu dari aplikasi utama...</p>
                </div>
            )}
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
