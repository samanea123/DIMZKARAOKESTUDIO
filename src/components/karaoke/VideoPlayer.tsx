
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
      // Hancurkan pemutar lama jika ada untuk menghindari duplikasi
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      
      // @ts-ignore
      playerRef.current = new window.YT.Player("youtube-player-iframe", {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          fs: 0, // Disable fullscreen button
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // @ts-ignore - YT.PlayerState.ENDED adalah 0
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
            if (nowPlaying) {
                addToHistory(nowPlaying);
            }
            playNextSong();
          },
        },
      });
    };

    const videoId = nowPlaying?.id?.videoId;

    if (videoId) {
       // @ts-ignore
      if (window.YT && window.YT.Player) {
        createPlayer(videoId);
      } else {
        // Jika API belum siap, tunggu event onYouTubeIframeAPIReady
        // @ts-ignore
        window.onYouTubeIframeAPIReady = () => {
          if (nowPlaying?.id?.videoId) {
            createPlayer(nowPlaying.id.videoId);
          }
        };
      }
    } else {
      // Jika tidak ada lagu, hancurkan pemutar yang ada
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    }
    
    // Cleanup function untuk menghancurkan pemutar saat komponen di-unmount
    return () => {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            try {
                playerRef.current.destroy();
            } catch (e) {
                console.error("Error destroying youtube player", e);
            }
            playerRef.current = null;
        }
    };
  }, [nowPlaying?.id?.videoId, addToHistory, playNextSong, toast]);


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
