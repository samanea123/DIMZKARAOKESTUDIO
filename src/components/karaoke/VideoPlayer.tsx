
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tv2 } from "lucide-react";
import { useEffect } from "react";

export default function VideoPlayer() {
  const { nowPlaying, playNextSong, addToHistory } = useKaraoke();

  useEffect(() => {
    if (nowPlaying) {
      // Logic for Chromecast can be added here
    }
  }, [nowPlaying]);

  const handleVideoEnd = () => {
    if (nowPlaying) {
      addToHistory(nowPlaying);
    }
    playNextSong();
  };

  const handleVideoError = () => {
    // If there's an error (e.g., video is private), play the next song
    playNextSong();
  };

  return (
    <Card className="h-full flex flex-col rounded-none border-0 border-b">
      <CardContent className="flex-1 p-0 flex items-center justify-center bg-black relative">
        {nowPlaying ? (
          <iframe
            key={nowPlaying.id.videoId}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${nowPlaying.id.videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onEnded={handleVideoEnd}
            onError={handleVideoError}
          ></iframe>
        ) : (
          <div className="text-center text-muted-foreground">
            <Tv2 size={48} className="mx-auto" />
            <p className="mt-4">Pilih lagu untuk diputar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
