
"use client";

import { useEffect, useRef } from "react";
import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider } from "@/context/KaraokeContext";

function MonitorPageContent() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const requestFullScreen = async () => {
            if (containerRef.current) {
                try {
                    // Coba request fullscreen
                    await containerRef.current.requestFullscreen();
                } catch (err) {
                    console.error("Gagal masuk mode layar penuh:", err);
                }
            }
        };
        // Beri sedikit jeda agar elemen siap sebelum request fullscreen
        const timer = setTimeout(requestFullScreen, 500);

        // Cleanup
        return () => clearTimeout(timer);

    }, []);

    return (
        <div ref={containerRef} className="flex flex-col h-screen bg-black">
            <div className="flex-1 w-full h-full">
                <VideoPlayer />
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
