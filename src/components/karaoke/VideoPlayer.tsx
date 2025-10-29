
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tv2 } from "lucide-react";
import { useEffect } from "react";

export default function VideoPlayer() {
  const { nowPlaying, playNextSong, addToHistory } = useKaraoke();

  useEffect(() => {
    // This is where Chromecast logic would go.
    // For now, it just plays in the iframe.
    if (nowPlaying) {
      // Example: `cast.framework.CastContext.getInstance().getCurrentSession()?.loadMedia(...)`
    }
  }, [nowPlaying]);

  const handleVideoEnd = () => {
    if (nowPlaying) {
      addToHistory(nowPlaying);
    }
    playNextSong();
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error("Video player error:", e);
    // If there's an error (e.g., video is private or removed), play the next song
    toast({
      variant: "destructive",
      title: "Video Error",
      description: "Video tidak dapat diputar, melompat ke lagu berikutnya.",
    });
    playNextSong();
  };

  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      {nowPlaying ? (
        <iframe
          key={nowPlaying.id.videoId}
          id="youtube-player"
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${nowPlaying.id.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
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

// Dummy toast for the component since useToast is not available here directly
// In a real app, you might pass toast down or use a global error handler.
const toast = (options: { variant: string; title: string; description: string; }) => {
  console.log(`Toast: ${options.title} - ${options.description}`);
};
