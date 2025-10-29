"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useKaraoke } from "@/context/KaraokeContext";
import { Music, Pause, Play, SkipBack, SkipForward, StopCircle, Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

export default function MiniMonitor() {
  const { nowPlaying, playNextSong, playPreviousSong, stopPlayback, history } = useKaraoke();
  const playerRef = useRef<YT.Player | null>(null);
  const playerDivId = "youtube-player";
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  // Load YouTube API and set up player
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

  // Control player based on nowPlaying
  useEffect(() => {
    if (nowPlaying && playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(nowPlaying.id.videoId);
      playerRef.current.setVolume(volume);
    } else if (!nowPlaying && playerRef.current) {
        playerRef.current.stopVideo();
        setIsPlaying(false);
        // Manually destroy and recreate player to show placeholder
        playerRef.current.destroy();
        createPlayer();
    } else if (nowPlaying && !playerRef.current && window.YT) {
        createPlayer();
    }
  }, [nowPlaying]);
  
  const createPlayer = () => {
    if (!document.getElementById(playerDivId)) return;
    
    playerRef.current = new YT.Player(playerDivId, {
      height: '100%',
      width: '100%',
      videoId: nowPlaying?.id.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0, // Hide native controls
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
            if(nowPlaying) {
                event.target.loadVideoById(nowPlaying.id.videoId);
                event.target.setVolume(volume);
                event.target.playVideo();
            }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data !== YT.PlayerState.BUFFERING) {
            setIsPlaying(false);
          }
          if (event.data === YT.PlayerState.ENDED) {
            playNextSong();
          }
        },
      },
    });
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    stopPlayback();
  };

  const handleNext = () => {
    playNextSong();
  };
  
  const handlePrevious = () => {
    playPreviousSong();
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;


  return (
    <Card className="h-full flex flex-col bg-black/50 border-2 border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
      <CardHeader>
        <CardTitle className="font-headline text-primary/80">Layar Monitor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-0 bg-black relative">
        <div id={playerDivId} className="w-full h-full" />
        {!nowPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold leading-loose text-gray-500 font-sans gap-2">
                <Music size={64} />
                <p>Pilih lagu untuk memulai</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="bg-black/30 p-2 md:p-4 border-t border-primary/20 flex-col gap-2">
          {nowPlaying && (
            <div className="flex items-center gap-4 w-full">
              <Music className="text-primary hidden md:block" size={24} />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-white truncate text-sm md:text-base">{nowPlaying.snippet.title}</p>
                <p className="text-xs text-muted-foreground">{nowPlaying.snippet.channelTitle}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-center gap-1 md:gap-2 w-full">
              <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={history.length === 0} className="hover:text-fuchsia-400">
                  <SkipBack />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePlayPause} disabled={!nowPlaying} className="hover:text-primary">
                  {isPlaying ? <Pause /> : <Play />}
              </Button>
               <Button variant="ghost" size="icon" onClick={handleStop} disabled={!nowPlaying} className="hover:text-red-500">
                  <StopCircle />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={!nowPlaying} className="hover:text-fuchsia-400">
                  <SkipForward />
              </Button>
              <div className="flex items-center gap-2 w-full max-w-[150px] ml-auto">
                  <VolumeIcon size={20} />
                  <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-full"
                  />
              </div>
          </div>
      </CardFooter>
    </Card>
  );
}
