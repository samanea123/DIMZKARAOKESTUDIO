
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { Tv2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function VideoPlayer() {
  const { nowPlaying, playNextSong, addToHistory } = useKaraoke();
  const playerRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fungsi untuk membuat pemutar YouTube
    const createPlayer = (videoId: string) => {
      // Hancurkan pemutar lama jika ada
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      
      // @ts-ignore
      playerRef.current = new window.YT.Player("youtube-player-iframe", {
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            controls: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // Jika video selesai (state 0)
            if (event.data === window.YT.PlayerState.ENDED) { 
              if (nowPlaying) {
                addToHistory(nowPlaying);
              }
              playNextSong();
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            toast({
              variant: "destructive",
              title: "Video Error",
              description: "Video tidak dapat diputar, melompat ke lagu berikutnya.",
            });
            // Tambahkan lagu yang gagal ke riwayat sebelum melompat
            if (nowPlaying) {
                addToHistory(nowPlaying);
            }
            playNextSong();
          },
        },
      });
    };

    // Fungsi untuk menginisialisasi pembuatan pemutar
    const initialize = () => {
        if (nowPlaying) {
            // @ts-ignore
            if (window.YT && window.YT.Player) {
                createPlayer(nowPlaying.id.videoId);
            } else {
                // Tunggu API YouTube siap jika belum ada
                // @ts-ignore
                window.onYouTubeIframeAPIReady = () => createPlayer(nowPlaying.id.videoId);
            }
        } else {
            // Jika tidak ada lagu, hancurkan pemutar
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        }
    }
    
    initialize();

    // Cleanup effect
    return () => {
      // Tidak perlu menghancurkan di sini karena akan ditangani saat lagu berikutnya dimainkan atau komponen di-unmount
    };
  // Dependensi useEffect adalah videoId dari nowPlaying. 
  // Ini memastikan useEffect berjalan setiap kali lagu berubah.
  }, [nowPlaying?.id.videoId]);


  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      {nowPlaying ? (
        <div id="youtube-player-iframe" className="w-full h-full" />
      ) : (
        <div className="text-center text-muted-foreground">
          <Tv2 size={48} className="mx-auto" />
          <p className="mt-4">Pilih lagu untuk diputar</p>
        </div>
      )}
    </div>
  );
}

