
"use client";

import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type FilterMode = "karaoke" | "original";
export type ActiveTab = "home" | "history" | "settings" | "favorites";

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

export interface QueueEntry extends YoutubeVideo {
    mode: FilterMode;
}

export interface HistoryEntry extends YoutubeVideo {
  playedAt: string;
  mode: FilterMode;
}

export interface FavoriteEntry extends YoutubeVideo {
  favoritedAt: string;
  mode: FilterMode;
}


interface KaraokeContextType {
  queue: QueueEntry[];
  songHistory: HistoryEntry[];
  favorites: FavoriteEntry[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  addSongToQueue: (song: YoutubeVideo, mode: FilterMode) => void;
  removeSongFromQueue: (videoId: string) => void;
  playSongFromQueue: (videoId: string) => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  stopPlayback: () => void;
  nowPlaying?: QueueEntry;
  addToHistory: (song: QueueEntry) => void;
  playFromHistory: (song: HistoryEntry) => void;
  clearHistory: () => void;
  addOrRemoveFavorite: (song: YoutubeVideo, mode: FilterMode) => void;
  isFavorite: (videoId: string) => boolean;
  playFromFavorites: (song: FavoriteEntry) => void;
}

const KaraokeContext = createContext<KaraokeContextType | undefined>(undefined);

export function KaraokeProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [songHistory, setSongHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const { toast } = useToast();
  
  useEffect(() => {
    try {
        const savedQueue = localStorage.getItem("dimz-karaoke-queue");
        if (savedQueue) {
            setQueue(JSON.parse(savedQueue));
        }
        const savedHistory = localStorage.getItem("dimz-karaoke-history");
        if (savedHistory) {
            setSongHistory(JSON.parse(savedHistory));
        }
        const savedFavorites = localStorage.getItem("dimz-karaoke-favorites");
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    } catch (error) {
        console.error("Could not load data from localStorage", error);
        setQueue([]);
        setSongHistory([]);
        setFavorites([]);
    }
  }, []);

  const updateQueue = (newQueue: QueueEntry[]) => {
    setQueue(newQueue);
    try {
      localStorage.setItem("dimz-karaoke-queue", JSON.stringify(newQueue));
    } catch (error) {
      console.error("Could not save queue to localStorage", error);
    }
  };

  const updateHistory = (newHistory: HistoryEntry[]) => {
    setSongHistory(newHistory);
    try {
      localStorage.setItem("dimz-karaoke-history", JSON.stringify(newHistory));
    } catch (error) {
      console.error("Could not save history to localStorage", error);
    }
  };
  
  const updateFavorites = (newFavorites: FavoriteEntry[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem("dimz-karaoke-favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Could not save favorites to localStorage", error);
    }
  };

  const addSongToQueue = (song: YoutubeVideo, mode: FilterMode) => {
    if (queue.some(s => s.id.videoId === song.id.videoId)) {
      toast({
        variant: "destructive",
        title: "Lagu Sudah Ada",
        description: `${song.snippet.title} sudah ada di dalam antrian.`,
      })
      return;
    }
    const newEntry: QueueEntry = { ...song, mode };
    updateQueue([...queue, newEntry]);
    toast({
      title: "Lagu Ditambahkan",
      description: `${song.snippet.title} telah ditambahkan ke antrian.`,
    })
  };

  const removeSongFromQueue = (videoId: string) => {
    updateQueue(queue.filter((song) => song.id.videoId !== videoId));
  };

  const playSongFromQueue = (videoId: string) => {
    const songToPlay = queue.find(song => song.id.videoId === videoId);
    if (!songToPlay) return;

    // Add currently playing song to history if there is one
    const currentSong = queue[0];
    if (currentSong && currentSong.id.videoId !== songToPlay.id.videoId) {
      addToHistory(currentSong);
    }
    
    const otherSongs = queue.filter(song => song.id.videoId !== videoId);
    updateQueue([songToPlay, ...otherSongs]);
  };

  const playNextSong = () => {
    if (queue.length <= 1) {
      updateQueue([]);
    } else {
      updateQueue(queue.slice(1));
    }
  };

  const playPreviousSong = () => {
    if (songHistory.length === 0) return;
    const lastPlayed = songHistory[0];
    updateHistory(songHistory.slice(1));
    const nowPlaying = queue[0];
    const newQueue = nowPlaying ? [lastPlayed, nowPlaying, ...queue.slice(1)] : [lastPlayed];
    updateQueue(newQueue);
  };

  const stopPlayback = () => {
    if(queue[0]) {
      addToHistory(queue[0]);
    }
    updateQueue([]);
  };

  const addToHistory = (song: QueueEntry) => {
    const newEntry: HistoryEntry = {
      ...song,
      playedAt: new Date().toISOString(),
    };

    const newHistory = [
      newEntry, 
      ...songHistory.filter(item => item.id.videoId !== song.id.videoId)
    ].slice(0, 50); // Keep last 50 songs
    
    updateHistory(newHistory);
  };
  
  const playFromHistory = (song: HistoryEntry) => {
      addSongToQueue(song, song.mode);
      // Wait a moment for state to update before playing
      setTimeout(() => {
        const songInQueue = queue.find(s => s.id.videoId === song.id.videoId) || { ...song };
        playSongFromQueue(songInQueue.id.videoId)
      }, 100);
  };

  const clearHistory = () => {
      updateHistory([]);
      toast({
        title: "Riwayat Dihapus",
        description: "Semua riwayat lagu telah dihapus.",
      })
  };

  const isFavorite = (videoId: string) => {
    return favorites.some(fav => fav.id.videoId === videoId);
  }

  const addOrRemoveFavorite = (song: YoutubeVideo, mode: FilterMode) => {
    if (isFavorite(song.id.videoId)) {
      // Remove from favorites
      const newFavorites = favorites.filter(fav => fav.id.videoId !== song.id.videoId);
      updateFavorites(newFavorites);
      toast({
        title: "Dihapus dari Favorit",
        description: `${song.snippet.title} telah dihapus dari daftar favorit.`,
      });
    } else {
      // Add to favorites
      const newEntry: FavoriteEntry = {
        ...song,
        favoritedAt: new Date().toISOString(),
        mode: mode,
      };
      const newFavorites = [newEntry, ...favorites];
      updateFavorites(newFavorites);
      toast({
        title: "Ditambahkan ke Favorit",
        description: `${song.snippet.title} telah ditambahkan ke daftar favorit.`,
      });
    }
  };

  const playFromFavorites = (song: FavoriteEntry) => {
    addSongToQueue(song, song.mode);
    // Wait a moment for state to update before playing
    setTimeout(() => {
        const songInQueue = queue.find(s => s.id.videoId === song.id.videoId) || { ...song };
        playSongFromQueue(songInQueue.id.videoId)
      }, 100);
  };

  const nowPlaying = queue[0];

  return (
    <KaraokeContext.Provider value={{ 
        queue, 
        songHistory,
        favorites,
        activeTab,
        setActiveTab,
        addSongToQueue, 
        removeSongFromQueue, 
        playSongFromQueue, 
        playNextSong, 
        playPreviousSong,
        stopPlayback,
        nowPlaying,
        addToHistory,
        playFromHistory,
        clearHistory,
        addOrRemoveFavorite,
        isFavorite,
        playFromFavorites
    }}>
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
