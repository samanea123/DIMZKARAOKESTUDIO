"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useKaraoke } from "@/context/KaraokeContext";
import { Music } from "lucide-react";
import { useEffect, useRef } from "react";

export default function MiniMonitor() {
  const { nowPlaying, playNextSong } = useKaraoke();
  const playerRef = useRef<YT.Player | null>(null);
  const playerDivId = "youtube-player";

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
      }
    };

    const onYouTubeIframeAPIReady = () => {
      createPlayer();
    };
    
    if (typeof window !== "undefined") {
      loadYouTubeAPI();
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (nowPlaying && playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(nowPlaying.id.videoId);
    } else if (!nowPlaying && playerRef.current) {
        playerRef.current.stopVideo();
        // Manually destroy and recreate player to show placeholder
        playerRef.current.destroy();
        createPlayer();
    } else if (nowPlaying && !playerRef.current && window.YT) {
        createPlayer();
    }
  }, [nowPlaying]);

  const createPlayer = () => {
    if (!document.getElementById(playerDivId)) return;
    
    const newPlayer = new YT.Player(playerDivId, {
      height: '100%',
      width: '100%',
      videoId: nowPlaying?.id.videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
      },
      events: {
        onReady: (event) => {
            playerRef.current = event.target;
            if(nowPlaying) {
                event.target.loadVideoById(nowPlaying.id.videoId);
                event.target.playVideo();
            }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            playNextSong();
          }
        },
      },
    });
  };

  return (
    <Card className="h-full flex flex-col bg-black/50 border-2 border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
      <CardHeader>
        <CardTitle className="font-headline text-primary/80">Layar Monitor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-0 bg-black">
        <div id={playerDivId} className="w-full h-full" />
        {!nowPlaying && (
            <div className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold leading-loose text-gray-500 font-sans">
                <p>Pilih lagu untuk memulai</p>
            </div>
        )}
      </CardContent>
      {nowPlaying && (
        <CardFooter className="bg-black/30 p-4 border-t border-primary/20">
          <div className="flex items-center gap-4">
            <Music className="text-primary" size={24} />
            <div>
              <p className="font-semibold text-white truncate">{nowPlaying.snippet.title}</p>
              <p className="text-sm text-muted-foreground">{nowPlaying.snippet.channelTitle}</p>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
