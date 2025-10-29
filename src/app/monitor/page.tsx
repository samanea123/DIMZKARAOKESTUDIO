"use client";

import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { KaraokeProvider } from "@/context/KaraokeContext";

export default function MonitorPage() {
    return (
        <KaraokeProvider>
            <div className="h-screen w-screen bg-black">
                <VideoPlayer isMonitor={true} />
            </div>
        </KaraokeProvider>
    );
}
