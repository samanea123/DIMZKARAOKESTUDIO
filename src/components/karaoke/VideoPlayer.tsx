
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { cn } from "@/lib/utils";
import { Maximize, Tv2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface VideoPlayerProps {
  isMonitor?: boolean;
}

export default function VideoPlayer({ isMonitor = false }: VideoPlayerProps) {
  const { nowPlaying, playNextSong, addToHistory } = useKaraoke();
  const playerRef = useRef<any>(null);
  const { toast } = useToast();
  const videoId = nowPlaying?.youtubeVideoId;

  useEffect(() => {
    // Fungsi untuk membuat pemutar YouTube
    const createPlayer = (id: string) => {
      // Hancurkan pemutar lama jika ada
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      
      try {
        // @ts-ignore - YT.Player
        playerRef.current = new window.YT.Player("youtube-player-iframe", {
          height: '100%',
          width: '100%',
          videoId: id,
          playerVars: {
            autoplay: 1,
            controls: isMonitor ? 0 : 1,
            fs: isMonitor ? 0 : 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
        });
      } catch (e) {
          // This can happen if the YT API is not ready yet.
          // The API ready listener will handle it.
      }
    };

    // Fungsi yang dipanggil saat status pemutar berubah
    const onPlayerStateChange = (event: any) => {
      // @ts-ignore - YT.PlayerState.ENDED adalah 0
      if (event.data === window.YT.PlayerState.ENDED) {
        if (nowPlaying) {
          addToHistory(nowPlaying);
        }
        playNextSong();
      }
    };
    
    // Fungsi yang dipanggil saat ada error pemutar
    const onPlayerError = (event: any) => {
      console.error("YouTube Player Error:", event.data);
      let errorMessage = "Video tidak dapat diputar, melompat ke lagu berikutnya.";
      if (event.data === 150 || event.data === 101) {
        errorMessage = "Pemilik video telah menonaktifkan pemutaran di luar YouTube. Melompat ke lagu berikutnya."
      }
      
      toast({
        variant: "destructive",
        title: "Video Error",
        description: errorMessage,
      });

      if (nowPlaying) {
          addToHistory(nowPlaying);
      }
      playNextSong();
    };


    // Logika utama untuk memuat video
    if (videoId) {
       // @ts-ignore
      if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
        // Jika YouTube IFrame API belum siap, tunggu
         // @ts-ignore
        window.onYouTubeIframeAPIReady = () => createPlayer(videoId);
      } else {
        // Jika API sudah siap, langsung buat pemutar
        if(document.getElementById("youtube-player-iframe")){
          createPlayer(videoId);
        }
      }
    } else {
      // Jika tidak ada videoId, hancurkan pemutar yang ada
      if (playerRef.current) {
        try {
            playerRef.current.destroy();
            playerRef.current = null;
        } catch(e) {
            // Player might already be gone
        }
      }
    }
    
    // Cleanup saat komponen unmount
    return () => {
      // @ts-ignore
      window.onYouTubeIframeAPIReady = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, isMonitor]);


  const handleEnterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.error("Error attempting to enable full-screen mode:", err.message, err.name);
        });
    }
  };

  const hasVideo = !!nowPlaying;

  // Tampilan untuk halaman Monitor
  if (isMonitor) {
      return (
        <div className="flex flex-col h-screen w-screen bg-black items-center justify-center text-white p-8">
            <div id="youtube-player-iframe" className={cn("w-full h-full", !hasVideo && "hidden")} />

            {!hasVideo && (
                <div className="text-center text-muted-foreground">
                    <Tv2 size={64} className="mx-auto mb-4" />
                    <h1 className="text-4xl font-headline text-white">Layar Monitor Karaoke</h1>
                    <p className="mt-2 mb-8">Menunggu lagu untuk diputar...</p>
                    <Button onClick={handleEnterFullscreen} size="lg">
                        <Maximize className="mr-2" />
                        Masuk Layar Penuh
                    </Button>
                </div>
            )}
        </div>
      );
  }

  // Tampilan untuk pemutar mini di halaman utama
  return (
    <div className="h-full w-full bg-black flex items-center justify-center relative">
        {/* Kontainer iframe akan selalu ada */}
        <div id="youtube-player-iframe" className={cn("w-full h-full transition-opacity duration-300", hasVideo ? "opacity-100" : "opacity-0")} />
        
        {/* Pesan "Pilih lagu" hanya tampil jika tidak ada video */}
        {!hasVideo && (
            <div className="absolute text-center text-muted-foreground">
                <Tv2 size={48} className="mx-auto" />
                <p className="mt-4">Pilih lagu untuk diputar</p>
            </div>
        )}
    </div>
  );
}
