
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { cn } from "@/lib/utils";
import { Tv2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  isMonitor?: boolean;
  videoUrl?: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ 
    isMonitor = false, 
    videoUrl: externalVideoUrl,
    onEnded: externalOnEnded
}: VideoPlayerProps) {
  const karaokeContext = !isMonitor ? useKaraoke() : null;
  const playerRef = useRef<any>(null);
  const { toast } = useToast();

  const videoUrl = isMonitor ? externalVideoUrl : karaokeContext?.nowPlaying?.videoUrl;
  const onEnded = isMonitor ? externalOnEnded : () => {
    if (karaokeContext?.nowPlaying) {
        karaokeContext.addToHistory(karaokeContext.nowPlaying);
    }
    karaokeContext?.playNextSong();
  };
  
  // Effect to Create/Destroy/Update Player
  useEffect(() => {
    const videoId = videoUrl ? new URL(videoUrl).pathname.split('/').pop() : undefined;

    const createPlayer = (id: string) => {
        if (playerRef.current) {
            playerRef.current.destroy();
        }
        try {
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
        } catch (e) {
            console.error("YT Player creation failed. API might not be ready.", e);
        }
    };
    
    const onPlayerStateChange = (event: any) => {
        // @ts-ignore
        if (event.data === window.YT.PlayerState.ENDED) {
            onEnded?.();
        }
    };
    
    const onPlayerError = (event: any) => {
        console.error("YouTube Player Error:", event.data);
        let errorMessage = "Video tidak dapat diputar, melompat ke lagu berikutnya.";
        if (event.data === 150 || event.data === 101) {
            errorMessage = "Pemilik video telah menonaktifkan pemutaran di luar YouTube. Melompat ke lagu berikutnya.";
        }
        toast({
            variant: "destructive",
            title: "Video Error",
            description: errorMessage,
        });
        onEnded?.();
    };

    const initialize = () => {
        if (videoId) {
            if (document.getElementById("youtube-player-iframe")) {
                createPlayer(videoId);
            }
        } else {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        }
    };

    // @ts-ignore
    if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
        // @ts-ignore
        window.onYouTubeIframeAPIReady = initialize;
    } else {
        initialize();
    }
    
    return () => {
        // @ts-ignore
        if (window.onYouTubeIframeAPIReady) { // Clean up listener
            // @ts-ignore
            window.onYouTubeIframeAPIReady = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, isMonitor]); // Rerun when videoUrl or monitor status changes

  const hasVideo = !!videoUrl;

  return (
    <div className="h-full w-full bg-black flex items-center justify-center relative">
        <div id="youtube-player-iframe" className={cn("w-full h-full transition-opacity duration-300", hasVideo ? "opacity-100" : "opacity-0")} />
        
        {!hasVideo && !isMonitor && (
            <div className="absolute text-center text-muted-foreground">
                <Tv2 size={48} className="mx-auto" />
                <p className="mt-4">Pilih lagu untuk diputar</p>
            </div>
        )}
    </div>
  );
}
