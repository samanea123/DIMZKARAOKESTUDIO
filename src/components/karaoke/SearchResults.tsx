
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Star } from "lucide-react";
import type { YoutubeVideo, FilterMode } from "@/context/KaraokeContext";
import { ScrollArea } from "../ui/scroll-area";
import { useKaraoke } from "@/context/KaraokeContext";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface SearchResult extends YoutubeVideo {
  mode: FilterMode;
}

export default function SearchResults({ videos }: { videos: SearchResult[] }) {
  const { addSongToQueue, addOrRemoveFavorite, isFavorite } = useKaraoke();

  return (
    <ScrollArea className="h-96 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
        {videos.map((video) => (
            <Card key={video.id.videoId} className="overflow-hidden group hover:border-primary transition-colors relative">
              <CardContent className="p-0 relative aspect-video">
                  <Image
                  src={video.snippet.thumbnails.high.url}
                  alt={video.snippet.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <Badge variant={video.mode === 'karaoke' ? 'default' : 'secondary'} className="absolute top-2 left-2 uppercase text-xs">
                      {video.mode}
                  </Badge>
              </CardContent>
              <div className="p-3">
                  <h3 className="text-sm font-semibold text-white truncate h-10">{video.snippet.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{video.snippet.channelTitle}</p>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Button 
                      size="icon" 
                      className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 h-12 w-12 bg-primary/80 backdrop-blur-sm hover:bg-primary"
                      onClick={() => addSongToQueue(video, video.mode)}
                  >
                      <Play className="fill-primary-foreground" />
                  </Button>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  addOrRemoveFavorite(video, video.mode);
                }}
              >
                <Star className={cn("h-5 w-5", isFavorite(video.id.videoId) ? "text-yellow-400 fill-yellow-400" : "")} />
              </Button>
            </Card>
        ))}
        </div>
    </ScrollArea>
  );
}
