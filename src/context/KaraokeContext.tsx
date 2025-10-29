
"use client";

import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch, serverTimestamp, getDocs } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { UseCollectionResult } from "@/firebase/firestore/use-collection";
import { useCollection } from "@/firebase";

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
    videoUrl: string;
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

export function KaraokeProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const db = firestore;

  const [songHistory, setSongHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [monitorWindow, setMonitorWindow] = useState<Window | null>(null);
  const { toast } = useToast();

  const queueQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
        collection(db, "users", user.uid, "songQueueItems"), 
        orderBy("order", "asc")
    );
  }, [db, user?.uid]);
  
  const { data: queue, isLoading: isQueueLoading }: UseCollectionResult<QueueEntry> = useCollection<QueueEntry>(queueQuery);
  
  useEffect(() => {
    if (user) {
        try {
            const savedHistory = localStorage.getItem(`dimz-karaoke-history-${user.uid}`);
            if (savedHistory) {
                setSongHistory(JSON.parse(savedHistory));
            }
            const savedFavorites = localStorage.getItem(`dimz-karaoke-favorites-${user.uid}`);
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (error) {
            console.error("Could not load data from localStorage", error);
            setSongHistory([]);
            setFavorites([]);
        }
    }
  }, [user]);

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
    if (!user) return;
    setSongHistory(newHistory);
    try {
      localStorage.setItem(`dimz-karaoke-history-${user.uid}`, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Could not save history to localStorage", error);
    }
  };
  
  const updateFavorites = (newFavorites: FavoriteEntry[]) => {
    if (!user) return;
    setFavorites(newFavorites);
    try {
      localStorage.setItem(`dimz-karaoke-favorites-${user.uid}`, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Could not save favorites to localStorage", error);
    }
  };

  const addSongToQueue = async (song: YoutubeVideo, mode: FilterMode) => {
    if (!db || !queue || !user) return;
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
        videoUrl: `https://www.youtube.com/embed/${song.id.videoId}`,
        title: song.snippet.title,
        channelTitle: song.snippet.channelTitle,
        thumbnails: song.snippet.thumbnails,
        mode,
        order: maxOrder + 1,
        addedAt: serverTimestamp(),
    };
    
    const collectionRef = collection(db, "users", user.uid, "songQueueItems");
    addDocumentNonBlocking(collectionRef, newEntry);

    toast({
      title: "Lagu Ditambahkan",
      description: `${song.snippet.title} telah ditambahkan ke antrian.`,
    })
  };

  const addSongToPlayNext = async (song: QueueEntry) => {
    if (!db || !queue || !user) return;
    
    // Jika ada lagu yang sedang diputar, letakkan setelahnya. Jika tidak, letakkan di urutan kedua.
    const newOrder = nowPlaying ? nowPlaying.order + 0.5 : 2;

    const docRef = doc(db, "users", user.uid, "songQueueItems", song.id);
    updateDocumentNonBlocking(docRef, { order: newOrder });

    toast({
      title: "Antrian Diperbarui",
      description: `${song.title} akan diputar berikutnya.`,
    });
  };

  const playNextFromAnywhere = async (song: YoutubeVideo, mode: FilterMode) => {
      if (!db || !queue || !user) return;
      const songInQueue = queue.find(s => s.youtubeVideoId === song.id.videoId);
      if (songInQueue) {
          await addSongToPlayNext(songInQueue);
      } else {
          // Jika ada lagu yang sedang diputar, letakkan setelahnya. Jika tidak, letakkan di urutan kedua.
          const newOrder = nowPlaying ? nowPlaying.order + 0.5 : 2;
          const newEntry = {
              youtubeVideoId: song.id.videoId,
              videoUrl: `https://www.youtube.com/embed/${song.id.videoId}`,
              title: song.snippet.title,
              channelTitle: song.snippet.channelTitle,
              thumbnails: song.snippet.thumbnails,
              mode,
              order: newOrder,
              addedAt: serverTimestamp(),
          };
          const collectionRef = collection(db, "users", user.uid, "songQueueItems");
          addDocumentNonBlocking(collectionRef, newEntry);

          toast({
              title: "Antrian Diperbarui",
              description: `${song.snippet.title} akan diputar berikutnya.`,
          });
      }
  };

  const removeSongFromQueue = (docId: string) => {
    if (!db || !user) return;
    const docRef = doc(db, "users", user.uid, "songQueueItems", docId);
    deleteDocumentNonBlocking(docRef);
  };

  const playSongFromQueue = (docId: string) => {
    if (!db || !queue || !user) return;
    
    const songToPlay = queue.find(s => s.id === docId);
    if (!songToPlay) return;

    // Jika lagu sudah diputar, tidak perlu lakukan apa-apa, VideoPlayer akan handle replay
    if (nowPlaying?.id === docId) {
      // VideoPlayer will handle this internally if needed.
      // Forcing a re-render by changing context state is an option if direct player manipulation is not preferred.
      return;
    }

    // Jika tidak ada lagu yang sedang diputar, set lagu ini sebagai lagu pertama
    // Jika ada, set ordernya lebih kecil dari lagu yang sedang diputar
    const newOrder = nowPlaying ? nowPlaying.order - 1 : new Date().getTime();
    
    const docRef = doc(db, "users", user.uid, "songQueueItems", docId);
    updateDocumentNonBlocking(docRef, { order: newOrder });
  };


  const playNextSong = () => {
    if (nowPlaying) {
      addToHistory(nowPlaying);
      removeSongFromQueue(nowPlaying.id);
    }
  };

  const playPreviousSong = () => {
    console.warn("Play previous song is not implemented for Firestore-backed queue yet.");
  };

  const stopPlayback = async () => {
    if(nowPlaying) {
      addToHistory(nowPlaying);
    }
    if (db && user) {
      // Get all docs and delete in a batch
      const collectionRef = collection(db, "users", user.uid, "songQueueItems");
      const snapshot = await getDocs(collectionRef);
      if(snapshot.empty) return;
      
      const batch = writeBatch(db);
      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
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
    ].slice(0, 50);
    
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
