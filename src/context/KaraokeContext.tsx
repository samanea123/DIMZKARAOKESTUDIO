"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

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
  nowPlaying?: YoutubeVideo;
}

const KaraokeContext = createContext<KaraokeContextType | undefined>(undefined);

export function KaraokeProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<YoutubeVideo[]>([]);
  
  const addSongToQueue = (song: YoutubeVideo) => {
    setQueue((prevQueue) => [...prevQueue, song]);
  };

  const removeSongFromQueue = (videoId: string) => {
    setQueue((prevQueue) => prevQueue.filter((song) => song.id.videoId !== videoId));
  };

  const nowPlaying = queue[0];

  return (
    <KaraokeContext.Provider value={{ queue, addSongToQueue, removeSongFromQueue, nowPlaying }}>
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
