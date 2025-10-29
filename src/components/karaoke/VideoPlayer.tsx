
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { cn } from "@/lib/utils";
import { Tv2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  isMonitor?: boolean;
}

export default function VideoPlayer({ isMonitor = false }: VideoPlayerProps) {
  const { nowPlaying, playNextSong, addToHistory } = useKaraoke();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  const videoId = nowPlaying?.youtubeVideoId;

  const handlePlay = () => {
    if (isMonitor && playerRef.current?.g?.requestFullscreen) {
      try {
        playerRef.current.g.requestFullscreen();
      } catch (err) {
        console.error("Gagal masuk mode layar penuh:", err);
      }
    }
  };

  useEffect(() => {
    const onPlayerStateChange = (event: any) => {
      // @ts-ignore - YT.PlayerState.ENDED adalah 0
      if (event.data === window.YT.PlayerState.ENDED) {
        if (nowPlaying) {
          addToHistory(nowPlaying);
        }
        playNextSong();
      }
      // @ts-ignore - YT.PlayerState.PLAYING adalah 1
      if (isMonitor && event.data === window.YT.PlayerState.PLAYING) {
        handlePlay();
      }
    };

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

    const createPlayer = (id: string) => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      // @ts-ignore
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
    };
    
    const loadVideoWithTransition = (newVideoId: string) => {
      setIsTransitioning(true);
      setTimeout(() => {
         // @ts-ignore
        if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
           // @ts-ignore
          window.onYouTubeIframeAPIReady = () => createPlayer(newVideoId);
        } else {
          if (playerRef.current && playerRef.current.loadVideoById) {
            playerRef.current.loadVideoById(newVideoId);
          } else {
            createPlayer(newVideoId);
          }
        }
        setTimeout(() => setIsTransitioning(false), 500);
      }, 600); 
    };
    
    if (videoId) {
        loadVideoWithTransition(videoId);
    } else {
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }
    }

    return () => {
      // @ts-ignore
      window.onYouTubeIframeAPIReady = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);


  return (
    <div ref={containerRef} className="h-full w-full bg-black flex items-center justify-center">
        <div 
          id="youtube-player-iframe" 
          className={cn(
              "w-full h-full transition-opacity duration-700",
              isTransitioning || !nowPlaying ? "opacity-0" : "opacity-100"
          )}
        />
        {!nowPlaying && !isTransitioning && (
            <div className="text-center text-muted-foreground">
            <Tv2 size={48} className="mx-auto" />
            <p className="mt-4">Pilih lagu untuk diputar</p>
            </div>
        )}
    </div>
  );
}
