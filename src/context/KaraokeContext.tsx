
"use client";

import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type FilterMode = "karaoke" | "non-karaoke";
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

export interface HistoryEntry extends YoutubeVideo {
  playedAt: string;
  mode: FilterMode;
}

export interface FavoriteEntry extends YoutubeVideo {
  favoritedAt: string;
  mode: FilterMode;
}


interface KaraokeContextType {
  queue: YoutubeVideo[];
  songHistory: HistoryEntry[];
  favorites: FavoriteEntry[];
  mode: FilterMode;
  setMode: (mode: FilterMode) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  addSongToQueue: (song: YoutubeVideo) => void;
  removeSongFromQueue: (videoId: string) => void;
  playSongFromQueue: (videoId: string) => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  stopPlayback: () => void;
  nowPlaying?: YoutubeVideo;
  addToHistory: (song: YoutubeVideo, mode: FilterMode) => void;
  playFromHistory: (song: HistoryEntry) => void;
  clearHistory: () => void;
  addOrRemoveFavorite: (song: YoutubeVideo, mode: FilterMode) => void;
  isFavorite: (videoId: string) => boolean;
  playFromFavorites: (song: FavoriteEntry) => void;
}

const KaraokeContext = createContext<KaraokeContextType | undefined>(undefined);

export function KaraokeProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<YoutubeVideo[]>([]);
  const [songHistory, setSongHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [mode, setMode] = useState<FilterMode>("karaoke");
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const { toast } = useToast();
  
  useEffect(() => {
    try {
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
        setSongHistory([]);
        setFavorites([]);
    }
  }, []);

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

  const playPreviousSong = () => {
    if (songHistory.length === 0) return;
    const lastPlayed = songHistory[0];
    updateHistory(songHistory.slice(1));
    setQueue(prev => [lastPlayed, ...prev]);
  };

  const stopPlayback = () => {
    setQueue([]);
  };

  const addToHistory = (song: YoutubeVideo, mode: FilterMode) => {
    const newEntry: HistoryEntry = {
      ...song,
      playedAt: new Date().toISOString(),
      mode: mode,
    };

    const newHistory = [
      newEntry, 
      ...songHistory.filter(item => item.id.videoId !== song.id.videoId)
    ].slice(0, 50); // Keep last 50 songs
    
    updateHistory(newHistory);
  };
  
  const playFromHistory = (song: HistoryEntry) => {
      addSongToQueue(song);
      playSongFromQueue(song.id.videoId);
      addToHistory(song, song.mode); // to update timestamp
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
    addSongToQueue(song);
    playSongFromQueue(song.id.videoId);
  };

  const nowPlaying = queue[0];

  return (
    <KaraokeContext.Provider value={{ 
        queue, 
        songHistory,
        favorites,
        mode,
        setMode,
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
