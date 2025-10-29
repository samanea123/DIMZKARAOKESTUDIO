
"use client";

import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch, serverTimestamp, addDoc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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

export interface QueueEntry {
    id: string; // Firestore document ID
    youtubeVideoId: string;
    title: string;
    channelTitle: string;
    thumbnails: YoutubeVideo['snippet']['thumbnails'];
    mode: FilterMode;
    order: number;
    addedAt: any; // Firestore Timestamp
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
  isQueueLoading: boolean;
  songHistory: HistoryEntry[];
  favorites: FavoriteEntry[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  addSongToQueue: (song: YoutubeVideo, mode: FilterMode) => void;
  addSongToPlayNext: (song: QueueEntry) => void;
  removeSongFromQueue: (docId: string) => void;
  playSongFromQueue: (docId: string) => void;
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
  playNextFromAnywhere: (song: YoutubeVideo, mode: FilterMode) => void;
  openMonitor: () => void;
}

const KaraokeContext = createContext<KaraokeContextType | undefined>(undefined);

// Hardcoded user ID for now
const TEMP_USER_ID = "shared-queue-user";

export function KaraokeProvider({ children }: { children: ReactNode }) {
  const { firestore } = useFirebase();
  const db = firestore;

  const [songHistory, setSongHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [monitorWindow, setMonitorWindow] = useState<Window | null>(null);
  const { toast } = useToast();

  // --- FIREBASE QUEUE SYNC ---
  const queueQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
        collection(db, "users", TEMP_USER_ID, "songQueueItems"), 
        orderBy("order", "asc")
    );
  }, [db]);
  
  const { data: queue, isLoading: isQueueLoading } = useCollection<QueueEntry>(queueQuery);
  // --- END FIREBASE QUEUE SYNC ---
  
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

  const nowPlaying = queue && queue.length > 0 ? queue[0] : undefined;

  useEffect(() => {
    if (nowPlaying && (!monitorWindow || monitorWindow.closed)) {
      // Temporarily disable auto-opening monitor to avoid pop-up blockers
      // openMonitor();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying]);

  const openMonitor = () => {
    if (monitorWindow && !monitorWindow.closed) {
        monitorWindow.focus();
    } else {
        const width = window.screen.width;
        const height = window.screen.height;
        const newWindow = window.open('/monitor', 'karaoke-monitor', `width=${width},height=${height}`);
        setMonitorWindow(newWindow);
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

  const addSongToQueue = async (song: YoutubeVideo, mode: FilterMode) => {
    if (!db || !queue) return;
    if (queue.some(s => s.youtubeVideoId === song.id.videoId)) {
      toast({
        variant: "destructive",
        title: "Lagu Sudah Ada",
        description: `${song.snippet.title} sudah ada di dalam antrian.`,
      })
      return;
    }
    
    const maxOrder = queue.reduce((max, s) => Math.max(max, s.order), 0);
    
    const newEntry = {
        youtubeVideoId: song.id.videoId,
        title: song.snippet.title,
        channelTitle: song.snippet.channelTitle,
        thumbnails: song.snippet.thumbnails,
        mode,
        order: maxOrder + 1,
        addedAt: serverTimestamp(),
    };
    
    const collectionRef = collection(db, "users", TEMP_USER_ID, "songQueueItems");
    addDocumentNonBlocking(collectionRef, newEntry);

    toast({
      title: "Lagu Ditambahkan",
      description: `${song.snippet.title} telah ditambahkan ke antrian.`,
    })
  };

  const addSongToPlayNext = async (song: QueueEntry) => {
    if (!db) return;

    // The song to be played next should have an order between nowPlaying (if it exists) and the next song
    const newOrder = (nowPlaying?.order || 0) + 0.5;

    const docRef = doc(db, "users", TEMP_USER_ID, "songQueueItems", song.id);
    updateDocumentNonBlocking(docRef, { order: newOrder });

    toast({
      title: "Antrian Diperbarui",
      description: `${song.title} akan diputar berikutnya.`,
    });
  };

  const playNextFromAnywhere = async (song: YoutubeVideo, mode: FilterMode) => {
      if (!db || !queue) return;
      const songInQueue = queue.find(s => s.youtubeVideoId === song.id.videoId);
      if (songInQueue) {
          await addSongToPlayNext(songInQueue);
      } else {
          const newOrder = (nowPlaying?.order || 0) + 0.5;
          const newEntry = {
              youtubeVideoId: song.id.videoId,
              title: song.snippet.title,
              channelTitle: song.snippet.channelTitle,
              thumbnails: song.snippet.thumbnails,
              mode,
              order: newOrder,
              addedAt: serverTimestamp(),
          };
          const collectionRef = collection(db, "users", TEMP_USER_ID, "songQueueItems");
          addDocumentNonBlocking(collectionRef, newEntry);

          toast({
              title: "Antrian Diperbarui",
              description: `${song.snippet.title} akan diputar berikutnya.`,
          });
      }
  };

  const removeSongFromQueue = (docId: string) => {
    if (!db) return;
    const docRef = doc(db, "users", TEMP_USER_ID, "songQueueItems", docId);
    deleteDocumentNonBlocking(docRef);
  };

  const playSongFromQueue = (docId: string) => {
    if (!db) return;
    const songToPlay = queue?.find(s => s.id === docId);
    if (!songToPlay) return;

    // To make it play now, we give it an order number smaller than the current `nowPlaying` song.
    const newOrder = (nowPlaying?.order ?? 1) - 1;
    
    const docRef = doc(db, "users", TEMP_USER_ID, "songQueueItems", docId);
    updateDocumentNonBlocking(docRef, { order: newOrder });
  };

  const playNextSong = () => {
    if (nowPlaying) {
      addToHistory(nowPlaying);
      removeSongFromQueue(nowPlaying.id);
    }
  };

  const playPreviousSong = () => {
    // This is complex with Firestore ordering, would need a more sophisticated history/state management
    console.warn("Play previous song is not implemented for Firestore-backed queue yet.");
  };

  const stopPlayback = () => {
    if(nowPlaying) {
      addToHistory(nowPlaying);
    }
    // Delete all songs in the queue
    if (db && queue) {
      const batch = writeBatch(db);
      queue.forEach(song => {
        const docRef = doc(db, "users", TEMP_USER_ID, "songQueueItems", song.id);
        batch.delete(docRef);
      });
      batch.commit();
    }
  };

  const addToHistory = (song: QueueEntry) => {
    const newHistoryEntry: HistoryEntry = {
        id: { videoId: song.youtubeVideoId },
        snippet: {
            title: song.title,
            channelTitle: song.channelTitle,
            thumbnails: song.thumbnails,
        },
        playedAt: new Date().toISOString(),
        mode: song.mode,
    };

    const newHistory = [
      newHistoryEntry, 
      ...songHistory.filter(item => item.id.videoId !== song.youtubeVideoId)
    ].slice(0, 50); // Keep last 50 songs
    
    updateHistory(newHistory);
  };
  
  const playFromHistory = (song: HistoryEntry) => {
      addSongToQueue(song, song.mode);
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
      const newFavorites = favorites.filter(fav => fav.id.videoId !== song.id.videoId);
      updateFavorites(newFavorites);
      toast({
        title: "Dihapus dari Favorit",
        description: `${song.snippet.title} telah dihapus dari daftar favorit.`,
      });
    } else {
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
  };


  return (
    <KaraokeContext.Provider value={{ 
        queue: queue || [],
        isQueueLoading,
        songHistory,
        favorites,
        activeTab,
        setActiveTab,
        addSongToQueue, 
        addSongToPlayNext,
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
        playFromFavorites,
        playNextFromAnywhere,
        openMonitor
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
