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
      toast({
        variant: "destructive",
        title: "Video Error",
        description: "Video tidak dapat diputar, melompat ke lagu berikutnya.",
      });
      if (nowPlaying) {
          addToHistory(nowPlaying);
      }
      playNextSong();
    };

    const createPlayer = () => {
      // Hancurkan pemutar lama jika ada
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }

      // Buat pemutar baru
      // @ts-ignore
      playerRef.current = new window.YT.Player("youtube-player-iframe", {
        videoId: videoId,
        playerVars: {
          autoplay: 1, // Penting untuk auto-play
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

    if (videoId) {
      // @ts-ignore
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        // @ts-ignore
        window.onYouTubeIframeAPIReady = createPlayer;
      }
    } else {
      // Jika tidak ada video, hancurkan pemutar
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      // @ts-ignore
      if(window.onYouTubeIframeAPIReady === createPlayer) {
        // @ts-ignore
        window.onYouTubeIframeAPIReady = undefined;
      }
    };
  }, [videoId, addToHistory, playNextSong, toast]);


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
