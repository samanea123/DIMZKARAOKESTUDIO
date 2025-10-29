
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader, Mic, Search } from "lucide-react";
import SearchResults from "./SearchResults";
import type { YoutubeVideo, FilterMode } from "@/context/KaraokeContext";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface SearchResult extends YoutubeVideo {
  mode: FilterMode;
}

export default function SongSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<FilterMode | 'all'>('all');

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSearched(true);

    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!API_KEY) {
      console.error("YouTube API Key is not set.");
      setLoading(false);
      return;
    }

    const fetchFromYoutube = async (searchQuery: string, mode: FilterMode) => {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
        searchQuery
      )}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.items) {
        return data.items.map((item: YoutubeVideo) => ({ ...item, mode }));
      }
      return [];
    };

    try {
      const karaokeQuery = `${query} karaoke`;
      const originalQuery = query;

      let karaokeResults: SearchResult[] = [];
      let originalResults: SearchResult[] = [];

      if (filter === 'all' || filter === 'karaoke') {
        karaokeResults = await fetchFromYoutube(karaokeQuery, "karaoke");
      }
      if (filter === 'all' || filter === 'original') {
        originalResults = await fetchFromYoutube(originalQuery, "original");
      }
      
      const combinedResults = [...karaokeResults, ...originalResults];
      const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id.videoId, item])).values());
      
      setResults(uniqueResults);
      if (uniqueResults.length === 0) {
        console.error("No items found or error in API response");
      }

    } catch (error) {
      console.error("Error fetching from YouTube API:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      <form onSubmit={handleSearch} className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          type="search"
          placeholder="Cari lagu atau artis..."
          className="pl-12 pr-12 h-14 text-lg bg-card border-2 border-border focus:border-primary focus:ring-primary/50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
          <Mic />
        </button>
      </form>

      <div className="flex justify-center gap-2">
        <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'default' : 'outline'} className={cn("transition-all", {"shadow-[0_0_10px_hsl(var(--primary))]": filter === 'all'})}>Semua</Button>
        <Button onClick={() => setFilter('karaoke')} variant={filter === 'karaoke' ? 'default' : 'outline'} className={cn("transition-all", {"shadow-[0_0_10px_hsl(var(--primary))]": filter === 'karaoke'})}>Karaoke</Button>
        <Button onClick={() => setFilter('original')} variant={filter === 'original' ? 'default' : 'outline'} className={cn("transition-all", {"shadow-[0_0_10px_hsl(var(--primary))]": filter === 'original'})}>Original</Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-8">
          <Loader className="animate-spin text-primary" size={48} />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center text-muted-foreground p-8">
          Tidak ada hasil ditemukan. Coba kata kunci lain.
        </div>
      )}

      {!loading && results.length > 0 && <SearchResults videos={results} />}
    </div>
  );
}
