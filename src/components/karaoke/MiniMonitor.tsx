
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useKaraoke } from "@/context/KaraokeContext";
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
  }
}


export default function MiniMonitor() {
  const { nowPlaying, playNextSong, playPreviousSong, stopPlayback, songHistory, addToHistory, mode } = useKaraoke();
  const playerRef = useRef<YT.Player | null>(null);
  const playerDivId = "youtube-player";
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const lastPlayedSongRef = useRef(nowPlaying);
  
  const [isCastApiAvailable, setIsCastApiAvailable] = useState(false);
  const [castSession, setCastSession] = useState<any | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  // 1. Initialize Cast API
  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        setIsCastApiAvailable(true);
        initializeCastApi();
      }
    };
    
    // Fallback if the script is already loaded
    if (window.cast && window.cast.framework) {
        setIsCastApiAvailable(true);
        initializeCastApi();
    }
  }, []);

  const initializeCastApi = () => {
    const castContext = window.cast.framework.CastContext.getInstance();
    
    castContext.setOptions({
      receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });
    
    const handleSessionStateChanged = (event: any) => {
      const session = castContext.getCurrentSession();
      if (event.sessionState === window.cast.framework.SessionState.SESSION_STARTED) {
        setIsCasting(true);
        setCastSession(session);
        if (nowPlaying) {
          loadMedia(nowPlaying, 0, true);
        }
      } else if (
          event.sessionState === window.cast.framework.SessionState.SESSION_ENDED ||
          event.sessionState === window.cast.framework.SessionState.SESSION_LOST
        ) {
        setIsCasting(false);
        setCastSession(null);
        if (nowPlaying && playerRef.current) {
            // Resume local playback if casting ends
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
      }
    };
    
    castContext.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        handleSessionStateChanged
    );
    
    // Restore existing session
    const session = castContext.getCurrentSession();
    if (session) {
      setIsCasting(true);
      setCastSession(session);
      syncCastPlayerState(); // Sync with the restored session
    }
  };
  
  // 2. Load media on the cast device
  const loadMedia = (song: YoutubeVideo, startTime = 0, autoplay = true) => {
    if (!isCasting || !castSession) return;

    // For YouTube, contentId is the videoId, contentType is 'video/x-youtube'
    const mediaInfo = new window.chrome.cast.media.MediaInfo(song.id.videoId, 'video/x-youtube');
    // It's a good practice to add metadata for the receiver app UI
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = song.snippet.title;
    mediaInfo.metadata.artist = song.snippet.channelTitle;
    mediaInfo.metadata.images = [{ 'url': song.snippet.thumbnails.high.url }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = autoplay;
    request.currentTime = startTime;

    castSession.loadMedia(request).then(
      () => {
        console.log('Load succeed'); 
        syncCastPlayerState();
      },
      (errorCode: any) => { 
        console.error('Error loading media: ' + errorCode); 
      }
    );
  };

  // 3. Sync local state with cast player state
  const syncCastPlayerState = () => {
    if (!isCasting || !castSession) return;
    const mediaSession = castSession.getMediaSession();
    if (!mediaSession) return;
    
    // Sync playing state
    setIsPlaying(mediaSession.playerState === 'PLAYING');
    
    // Sync volume
    setVolume(mediaSession.volume.level * 100);

    // Add listeners for remote changes
    mediaSession.addUpdateListener((isAlive: boolean) => {
        if (!isAlive) {
            setIsPlaying(false);
            return;
        }
        const currentIsPlaying = mediaSession.playerState === 'PLAYING' || mediaSession.playerState === 'BUFFERING';
        setIsPlaying(currentIsPlaying);

        // Handle auto-next when song finishes on cast device
        if (mediaSession.idleReason === 'FINISHED' && mediaSession.playerState === 'IDLE') {
          if(lastPlayedSongRef.current) {
            addToHistory(lastPlayedSongRef.current, mode);
          }
          playNextSong();
        }
    });
  };


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
    if (isCasting && castSession && nowPlaying) {
      loadMedia(nowPlaying);
      playerRef.current?.pauseVideo(); // Pause local player when casting starts
    } else if (nowPlaying && playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(nowPlaying.id.videoId);
      playerRef.current.setVolume(volume);
    } else if (!nowPlaying && playerRef.current) {
        playerRef.current.stopVideo();
        setIsPlaying(false);
        playerRef.current.destroy(); // Manually destroy to show placeholder
        createPlayer();
    } else if (nowPlaying && !playerRef.current && window.YT) {
        createPlayer();
    }

    if(nowPlaying) {
      lastPlayedSongRef.current = nowPlaying;
    }
  }, [nowPlaying, isCasting, castSession]); // Re-evaluate when casting state changes
  
  const createPlayer = () => {
    if (!document.getElementById(playerDivId) || playerRef.current) return;
    
    playerRef.current = new window.YT.Player(playerDivId, {
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
            if(nowPlaying && !isCasting) {
                event.target.setVolume(volume);
                event.target.playVideo();
            }
        },
        onStateChange: (event) => {
          if (!isCasting) { // Only control state if not casting
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            else if (event.data !== window.YT.PlayerState.BUFFERING) setIsPlaying(false);
          }
          if (event.data === window.YT.PlayerState.ENDED) {
            if(lastPlayedSongRef.current) addToHistory(lastPlayedSongRef.current, mode);
            playNextSong();
          }
        },
      },
    });
  };

  const handlePlayPause = () => {
    if (!nowPlaying) return;
    if (isCasting && castSession && castSession.getMediaSession()) {
        const mediaSession = castSession.getMediaSession();
        if (mediaSession.playerState === 'PLAYING') {
            mediaSession.pause(null);
        } else {
            mediaSession.play(null);
        }
        return;
    }
    if (!playerRef.current) return;
    const playerState = playerRef.current.getPlayerState();
    if (playerState === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleStop = () => {
    if (isCasting && castSession && castSession.getMediaSession()) {
      castSession.getMediaSession().stop(null, 
        () => { 
            // This will trigger state change listeners to update UI
        }, 
        () => console.error("Failed to stop cast media")
      );
    }
    if (nowPlaying) {
      addToHistory(nowPlaying, mode);
    }
    stopPlayback(); // This clears the queue
  };

  const handleNext = () => {
    if (nowPlaying) {
      addToHistory(nowPlaying, mode);
    }
    playNextSong();
  };
  
  const handlePrevious = () => {
    playPreviousSong();
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
     if (isCasting && castSession && castSession.getMediaSession()) {
      const volumeRequest = new window.chrome.cast.media.VolumeRequest();
      const newCastVolume = new window.chrome.cast.Volume();
      newCastVolume.level = vol / 100;
      volumeRequest.volume = newCastVolume;
      castSession.getMediaSession().setVolume(volumeRequest, () => {}, () => {});
    } else if (playerRef.current) {
      playerRef.current.setVolume(vol);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <Card className="h-full flex flex-col bg-black/50 border-2 border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="font-headline text-primary/80">Layar Monitor</CardTitle>
        {isCastApiAvailable && <google-cast-launcher class={cn(isCasting ? "text-primary" : "")}></google-cast-launcher>}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-0 bg-black relative">
        {/* Local Player Div, hidden when casting */}
        <div id={playerDivId} className={cn("w-full h-full", { 'opacity-0 pointer-events-none': isCasting })} />
        
        {/* Placeholder shown when no song is playing OR when casting */}
        {(!nowPlaying || isCasting) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold leading-loose text-gray-500 font-sans gap-2 p-4">
                <Music size={64} />
                <p>{isCasting ? (nowPlaying ? "Memutar di TV" : "Pilih lagu untuk di-cast") : "Pilih lagu untuk memulai"}</p>
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

    