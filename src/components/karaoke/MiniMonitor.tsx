"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useKaraoke } from "@/context/KaraokeContext";
import { Music } from "lucide-react";

export default function MiniMonitor() {
  const { queue } = useKaraoke();
  const nowPlaying = queue[0];

  return (
    <Card className="h-full flex flex-col bg-black/50 border-2 border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
      <CardHeader>
        <CardTitle className="font-headline text-primary/80">Layar Monitor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-0 bg-black">
        {nowPlaying ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${nowPlaying.id.videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold leading-loose text-gray-500 font-sans">
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
