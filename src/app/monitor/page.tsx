
"use client";

import VideoPlayer from "@/components/karaoke/VideoPlayer";
import { useState, useEffect, useCallback } from "react";
import type { QueueEntry } from "@/context/KaraokeContext";
import { Button } from "@/components/ui/button";
import { Maximize, Tv2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NOW_PLAYING_STORAGE_KEY = 'dimz-karaoke-now-playing';

export default function MonitorPage() {
    const [nowPlaying, setNowPlaying] = useState<QueueEntry | null>(null);

    const handleEnterFullscreen = useCallback(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error("Error attempting to enable full-screen mode:", err.message, err.name);
            });
        }
    }, []);

    // Initial load from localStorage
    useEffect(() => {
        try {
            const storedSong = localStorage.getItem(NOW_PLAYING_STORAGE_KEY);
            if (storedSong) {
                setNowPlaying(JSON.parse(storedSong));
            }
        } catch (error) {
            console.error("Failed to read from localStorage:", error);
        }

        // Listen for storage changes from other tabs/windows
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === NOW_PLAYING_STORAGE_KEY) {
                try {
                    if (event.newValue) {
                        const newSong = JSON.parse(event.newValue);
                        setNowPlaying(newSong);
                        // Automatically try to go fullscreen when a new song starts playing
                        handleEnterFullscreen();
                    } else {
                        setNowPlaying(null);
                    }
                } catch (error) {
                    console.error("Failed to parse localStorage update:", error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [handleEnterFullscreen]);

    // Automatically try to go fullscreen when the first song appears
    useEffect(() => {
        if (nowPlaying) {
            handleEnterFullscreen();
        }
    }, [nowPlaying, handleEnterFullscreen]);


    const hasVideo = !!nowPlaying;

    return (
        <div className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white p-8">
            <VideoPlayer
                isMonitor={true}
                videoUrl={nowPlaying?.videoUrl}
                onEnded={() => { /* In monitor mode, we just wait for the next update */ }}
            />

            {!hasVideo && (
                <div className="text-center text-muted-foreground max-w-lg">
                    <Tv2 size={64} className="mx-auto mb-4" />
                    <h1 className="text-4xl font-headline text-white">Layar Monitor Karaoke</h1>
                    <p className="mt-2 mb-6">Menunggu lagu untuk diputar...</p>
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-400">
                        <p className="font-semibold text-white mb-2">Tips untuk Menampilkan di TV:</p>
                        <p>Untuk menampilkan di TV, gunakan fitur 'Cast' dari menu browser Anda (Chrome, Edge) dan pilih tab ini untuk dicerminkan ke layar TV atau perangkat Chromecast Anda.</p>
                    </div>
                    <Button onClick={handleEnterFullscreen} size="lg" className="mt-8">
                        <Maximize className="mr-2" />
                        Masuk Layar Penuh
                    </Button>
                </div>
            )}
        </div>
    );
}
