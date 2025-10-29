
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useKaraoke, type YoutubeVideo } from "@/context/KaraokeContext";
import { Music, Pause, Play, SkipBack, SkipForward, StopCircle, Volume1, Volume2, VolumeX, Cast } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast?: any;
    chrome?: any;
    YT: any;
    PresentationRequest: any;
  }
}


export default function MiniMonitor() {
  const { nowPlaying, playNextSong, playPreviousSong, stopPlayback, songHistory, addToHistory } = useKaraoke();
  const playerRef = useRef<YT.Player | null>(null);
  const playerDivId = "youtube-player";
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const lastPlayedSongRef = useRef(nowPlaying);
  
  const [isCastApiAvailable, setIsCastApiAvailable] = useState(false);
  const [castSession, setCastSession] = useState<any | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const mediaSessionRef = useRef<any | null>(null);

  // 1. Initialize Cast API
  useEffect(() => {
    // pastikan window.cast ada
    const initializeCastApi = () => {
      if (window.cast && window.cast.framework) {
        try {
            const context = window.cast.framework.CastContext.getInstance();
            context.setOptions({
              receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
              autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            });
        } catch(e) {
            console.error("Failed to initialize cast framework", e);
        }
      }
    };

    // tunggu cast api ready
    const interval = setInterval(() => {
      if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
        initializeCastApi();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load YouTube API and set up player
  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      createPlayer();
    };
    
    if (typeof window !== "undefined") {
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      }
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  // Control player based on nowPlaying
  useEffect(() => {
    if (nowPlaying) {
      if (playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(nowPlaying.id.videoId);
        playerRef.current.setVolume(volume);
      } else if (!playerRef.current && window.YT) {
          createPlayer();
      }
      lastPlayedSongRef.current = nowPlaying;
    } else {
       if(playerRef.current) {
          playerRef.current.stopVideo();
          setIsPlaying(false);
          playerRef.current.destroy();
          createPlayer();
       }
    }
  }, [nowPlaying]); 
  
  const createPlayer = () => {
    if (!document.getElementById(playerDivId) || playerRef.current) return;
    
    const newPlayer = new window.YT.Player(playerDivId, {
      height: '100%',
      width: '100%',
      videoId: nowPlaying?.id.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
            playerRef.current = newPlayer; // Assign here to ensure it's set
            if(nowPlaying) {
                event.target.setVolume(volume);
                event.target.playVideo();
            }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
          else if (event.data !== window.YT.PlayerState.BUFFERING) setIsPlaying(false);
          
          if (event.data === window.YT.PlayerState.ENDED) {
            if(lastPlayedSongRef.current) addToHistory(lastPlayedSongRef.current);
            playNextSong();
          }
        },
      },
    });
  };

  const handlePlayPause = () => {
    if (!nowPlaying) return;
    if (!playerRef.current) return;
    const playerState = playerRef.current.getPlayerState();
    if (playerState === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleStop = () => {
    if (nowPlaying) {
      addToHistory(nowPlaying);
    }
    stopPlayback();
  };

  const handleNext = () => {
    if (nowPlaying) {
      addToHistory(nowPlaying);
    }
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
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="font-headline text-primary/80">Layar Monitor</CardTitle>
        <button
            onClick={() => {
              if ("presentation" in window) {
                try {
                  const request = new window.PresentationRequest(["https://example.com"]);
                  request.start();
                } catch (e) {
                  console.error(e);
                }
              }
            }}
          >
            Cast Video
        </button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-0 bg-black relative">
        <div id={playerDivId} className={cn("w-full h-full")} />
        
        {!nowPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold leading-loose text-gray-500 font-sans gap-2 p-4">
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
              <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={songHistory.length === 0} className="hover:text-fuchsia-400">
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
