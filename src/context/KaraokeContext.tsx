"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface YoutubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string; };
      medium: { url: string; };
      high: { url: string; };
    };
  };
}

interface KaraokeContextType {
  queue: YoutubeVideo[];
  addSongToQueue: (song: YoutubeVideo) => void;
  removeSongFromQueue: (videoId: string) => void;
  playSongFromQueue: (videoId: string) => void;
  playNextSong: () => void;
  nowPlaying?: YoutubeVideo;
}

const KaraokeContext = createContext<KaraokeContextType | undefined>(undefined);

export function KaraokeProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<YoutubeVideo[]>([]);
  const { toast } = useToast();
  
  const addSongToQueue = (song: YoutubeVideo) => {
    if (queue.some(s => s.id.videoId === song.id.videoId)) {
      toast({
        variant: "destructive",
        title: "Lagu Sudah Ada",
        description: `${song.snippet.title} sudah ada di dalam antrian.`,
      })
      return;
    }
    setQueue((prevQueue) => [...prevQueue, song]);
    toast({
      title: "Lagu Ditambahkan",
      description: `${song.snippet.title} telah ditambahkan ke antrian.`,
    })
  };

  const removeSongFromQueue = (videoId: string) => {
    setQueue((prevQueue) => prevQueue.filter((song) => song.id.videoId !== videoId));
  };

  const playSongFromQueue = (videoId: string) => {
    setQueue((prevQueue) => {
      const songToPlay = prevQueue.find(song => song.id.videoId === videoId);
      if (!songToPlay) return prevQueue;

      const otherSongs = prevQueue.filter(song => song.id.videoId !== videoId);
      return [songToPlay, ...otherSongs];
    });
  };

  const playNextSong = () => {
    setQueue((prevQueue) => {
      if (prevQueue.length <= 1) {
        return [];
      }
      return prevQueue.slice(1);
    });
  };

  const nowPlaying = queue[0];

  return (
    <KaraokeContext.Provider value={{ queue, addSongToQueue, removeSongFromQueue, playSongFromQueue, playNextSong, nowPlaying }}>
      {children}
    </KaraokeContext.Provider>
  );
}

export function useKaraoke() {
  const context = useContext(KaraokeContext);
  if (context === undefined) {
    throw new Error("useKaraoke must be used within a KaraokeProvider");
  }
  return context;
}
