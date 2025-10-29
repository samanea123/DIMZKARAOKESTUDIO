
"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader, Search } from "lucide-react";
import SearchResults from "./SearchResults";
import type { YoutubeVideo, FilterMode } from "@/context/KaraokeContext";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from 'use-debounce';

interface SearchResult extends YoutubeVideo {
  mode: FilterMode;
}

export default function SongSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<FilterMode | 'all'>('all');
  
  const [nextPageTokens, setNextPageTokens] = useState<{ karaoke?: string; original?: string }>({});

  const performSearch = async (searchQuery: string, currentFilter: FilterMode | 'all', loadMore = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    
    setLoading(true);
    if (!loadMore) {
      setResults([]);
      setSearched(true);
      setNextPageTokens({});
    }

    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!API_KEY) {
      console.error("YouTube API Key is not set.");
      setLoading(false);
      return;
    }

    const fetchFromYoutube = async (apiQuery: string, mode: FilterMode, pageToken?: string): Promise<{ items: SearchResult[], nextPageToken?: string }> => {
      let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
        apiQuery
      )}&key=${API_KEY}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) {
          const items = data.items.map((item: YoutubeVideo) => ({ ...item, mode }));
          return { items, nextPageToken: data.nextPageToken };
        }
        if (data.error) {
            console.error("YouTube API Error:", data.error.message);
        }
      } catch (error) {
        console.error(`Error fetching ${mode} videos:`, error);
      }
      return { items: [], nextPageToken: undefined };
    };

    try {
      const karaokeQuery = `${searchQuery} karaoke`;
      const originalQuery = searchQuery;

      const searches: Promise<{ items: SearchResult[], nextPageToken?: string }>[] = [];
      let modesToFetch: FilterMode[] = [];

      if (currentFilter === 'all' || currentFilter === 'karaoke') {
        if (!loadMore || (loadMore && nextPageTokens.karaoke !== undefined)) {
            modesToFetch.push('karaoke');
        }
      }
      if (currentFilter === 'all' || currentFilter === 'original') {
        if (!loadMore || (loadMore && nextPageTokens.original !== undefined)) {
            modesToFetch.push('original');
        }
      }

      for (const mode of modesToFetch) {
        if (mode === 'karaoke') {
          searches.push(fetchFromYoutube(karaokeQuery, 'karaoke', loadMore ? nextPageTokens.karaoke : undefined));
        } else if (mode === 'original') {
          searches.push(fetchFromYoutube(originalQuery, 'original', loadMore ? nextPageTokens.original : undefined));
        }
      }
      
      const newNextPageTokens: { karaoke?: string; original?: string } = { ...nextPageTokens };
      const searchResultsData = await Promise.all(searches);
      let combinedResults: SearchResult[] = loadMore ? results : [];

      searchResultsData.forEach((result, index) => {
        const mode = modesToFetch[index];
        combinedResults = [...combinedResults, ...result.items];
        newNextPageTokens[mode] = result.nextPageToken;
      });
      
      const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id.videoId, item])).values());
      
      setResults(uniqueResults);
      setNextPageTokens(newNextPageTokens);

    } catch (error) {
      console.error("Error fetching from YouTube API:", error);
      if (!loadMore) {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebouncedCallback((searchQuery: string, currentFilter: FilterMode | 'all') => {
      performSearch(searchQuery, currentFilter, false);
  }, 300);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery, filter);
  };
  
  const handleFilterChange = (newFilter: FilterMode | 'all') => {
    setFilter(newFilter);
    performSearch(query, newFilter, false);
  }
  
  const handleLoadMore = () => {
      performSearch(query, filter, true);
  }

  const canLoadMore = (filter === 'all' && (nextPageTokens.karaoke !== undefined || nextPageTokens.original !== undefined)) ||
                      (filter === 'karaoke' && nextPageTokens.karaoke !== undefined) ||
                      (filter === 'original' && nextPageTokens.original !== undefined);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          type="search"
          placeholder="Cari lagu atau artis..."
          className="pl-12 pr-4 h-14 text-lg bg-card border-2 border-border focus:border-primary focus:ring-primary/50"
          value={query}
          onChange={handleQueryChange}
        />
      </form>

      <div className="flex justify-center gap-2">
        <Button onClick={() => handleFilterChange('all')} variant={filter === 'all' ? 'default' : 'outline'} className={cn("transition-all", {"shadow-[0_0_10px_hsl(var(--primary))]": filter === 'all'})}>Semua</Button>
        <Button onClick={() => handleFilterChange('karaoke')} variant={filter === 'karaoke' ? 'default' : 'outline'} className={cn("transition-all", {"shadow-[0_0_10px_hsl(var(--primary))]": filter === 'karaoke'})}>Karaoke</Button>
        <Button onClick={() => handleFilterChange('original')} variant={filter === 'original' ? 'default' : 'outline'} className={cn("transition-all", {"shadow-[0_0_10px_hsl(var(--primary))]": filter === 'original'})}>Original</Button>
      </div>

      {loading && results.length === 0 && (
        <div className="flex justify-center items-center p-8">
          <Loader className="animate-spin text-primary" size={48} />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center text-muted-foreground p-8">
          Tidak ada hasil ditemukan. Coba kata kunci lain.
        </div>
      )}

      {results.length > 0 && <SearchResults videos={results} />}
      
      {canLoadMore && !loading && (
        <div className="flex justify-center mt-4">
            <Button onClick={handleLoadMore} variant="outline">
                Load More
            </Button>
        </div>
      )}

      {loading && results.length > 0 && (
         <div className="flex justify-center items-center p-4">
          <Loader className="animate-spin text-primary" size={24} />
        </div>
      )}

    </div>
  );
}
