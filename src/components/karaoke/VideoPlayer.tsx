
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { Tv2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function VideoPlayer() {
  const { nowPlaying, playNextSong, addToHistory } = useKaraoke();
  const playerRef = useRef<any>(null);
  const { toast } = useToast();
  const videoId = nowPlaying?.id?.videoId;

  useEffect(() => {
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

    const setupPlayer = () => {
      if (playerRef.current) return; // Jangan buat jika sudah ada

      // @ts-ignore
      playerRef.current = new window.YT.Player("youtube-player-iframe", {
        height: '100%',
        width: '100%',
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

    // Inisialisasi API YouTube
    // @ts-ignore
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      // @ts-ignore
      window.onYouTubeIframeAPIReady = setupPlayer;
    } else {
      setupPlayer();
    }

    // Efek ini menangani pemuatan video baru
    if (playerRef.current && playerRef.current.loadVideoById) {
      if (videoId) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.stopVideo();
        playerRef.current.clearVideo();
      }
    } else if (videoId) {
        // Jika pemutar belum siap tapi sudah ada videoId, coba buat lagi saat API siap
        // @ts-ignore
        window.onYouTubeIframeAPIReady = () => {
            // @ts-ignore
            playerRef.current = new window.YT.Player("youtube-player-iframe", {
                height: '100%',
                width: '100%',
                videoId: videoId, // Muat video pertama kali
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
    }

    // Cleanup: hanya hapus listener onYouTubeIframeAPIReady
    return () => {
        // @ts-ignore
        if (window.onYouTubeIframeAPIReady) {
             // @ts-ignore
            window.onYouTubeIframeAPIReady = null;
        }
    };

  }, [videoId, addToHistory, playNextSong, toast]);


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
