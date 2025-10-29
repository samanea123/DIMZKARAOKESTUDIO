
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
    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      // @ts-ignore
      playerRef.current = new window.YT.Player("youtube-player-iframe", {
        videoId: nowPlaying?.id.videoId,
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (event.data === 0) { // 0 = ended
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
             if (nowPlaying) {
                addToHistory(nowPlaying);
              }
            playNextSong();
          },
        },
      });
    };

    if (nowPlaying) {
      // @ts-ignore
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        // If YT API is not ready, wait for it.
        // @ts-ignore
        window.onYouTubeIframeAPIReady = createPlayer;
      }
    } else {
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }
    }
    
    return () => {
        // Cleanup on component unmount
        if (playerRef.current) {
            // Check if destroy is a function before calling it
            if (typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
            }
            playerRef.current = null;
        }
    };

  }, [nowPlaying?.id.videoId]);


  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      {nowPlaying ? (
        <iframe
          id="youtube-player-iframe"
          key={nowPlaying.id.videoId}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${nowPlaying.id.videoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="text-center text-muted-foreground">
          <Tv2 size={48} className="mx-auto" />
          <p className="mt-4">Pilih lagu untuk diputar</p>
        </div>
      )}
    </div>
  );
}
