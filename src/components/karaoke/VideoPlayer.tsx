
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { Tv2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function VideoPlayer() {
  const { nowPlaying, playNextSong, addToHistory } = useKaraoke();
  const playerRef = useRef<any>(null);
  const { toast } = useToast();
  const videoId = nowPlaying?.youtubeVideoId;

  useEffect(() => {
    // Fungsi untuk menangani event
    const onPlayerStateChange = (event: any) => {
      // @ts-ignore - YT.PlayerState.ENDED adalah 0
      if (event.data === window.YT.PlayerState.ENDED) {
        if (nowPlaying) {
          addToHistory(nowPlaying);
        }
        playNextSong();
      }
    };

    const onPlayerError = (event: any) => {
      console.error("YouTube Player Error:", event.data);
      let errorMessage = "Video tidak dapat diputar, melompat ke lagu berikutnya.";
      // Error 150 & 101 adalah umum untuk video yang dibatasi pemutarannya
      if (event.data === 150 || event.data === 101) {
        errorMessage = "Pemilik video telah menonaktifkan pemutaran di luar YouTube. Melompat ke lagu berikutnya."
      }
      
      toast({
        variant: "destructive",
        title: "Video Error",
        description: errorMessage,
      });

      // Tetap tambahkan ke riwayat meskipun error, lalu putar lagu berikutnya
      if (nowPlaying) {
          addToHistory(nowPlaying);
      }
      playNextSong();
    };

    // Fungsi untuk membuat pemutar
    const createPlayer = () => {
      // Hancurkan pemutar lama jika ada
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      // @ts-ignore
      playerRef.current = new window.YT.Player("youtube-player-iframe", {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    };

    // Logika utama
    if (videoId) {
      // @ts-ignore
      if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
        // Jika API belum siap, tunggu
        // @ts-ignore
        window.onYouTubeIframeAPIReady = createPlayer;
      } else {
        // Jika API sudah siap
        if (playerRef.current && playerRef.current.loadVideoById) {
          // Jika pemutar sudah ada, cukup muat video baru
          playerRef.current.loadVideoById(videoId);
        } else {
          // Jika pemutar belum ada, buat pemutar baru
          createPlayer();
        }
      }
    } else {
      // Jika tidak ada videoId, hancurkan pemutar jika ada
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    }

    // Cleanup: Pastikan pemutar dihancurkan saat komponen unmount
    return () => {
      // @ts-ignore
      window.onYouTubeIframeAPIReady = null; // Hapus listener global untuk mencegah kebocoran
    };

  }, [videoId, addToHistory, playNextSong, toast, nowPlaying]);


  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
        <div id="youtube-player-iframe" className="w-full h-full" style={{ display: nowPlaying ? 'block' : 'none' }} />
        {!nowPlaying && (
            <div className="text-center text-muted-foreground">
            <Tv2 size={48} className="mx-auto" />
            <p className="mt-4">Pilih lagu untuk diputar</p>
            </div>
        )}
    </div>
  );
}

    