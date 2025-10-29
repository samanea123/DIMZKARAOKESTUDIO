
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader, Mic, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import SearchResults from "./SearchResults";
import type { YoutubeVideo } from "@/context/KaraokeContext";
import { useKaraoke } from "@/context/KaraokeContext";


export default function SongSearch() {
  const { mode, setMode } = useKaraoke();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSearched(true);

    const searchQuery = mode === "karaoke" ? `${query} karaoke` : query;
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!API_KEY) {
      console.error("YouTube API Key is not set.");
      // You can also show a toast message to the user
      setLoading(false);
      return;
    }
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
      searchQuery
    )}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.items) {
        setResults(data.items);
      } else {
        console.error("No items found or error in API response", data);
        setResults([]);
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
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          className={cn(
            "rounded-full px-6 py-2 text-base font-semibold transition-all duration-300 border-2",
            mode === "karaoke"
              ? "border-primary text-primary shadow-[0_0_10px_hsl(var(--primary)),inset_0_0_10px_hsl(var(--primary)/0.5)] bg-primary/10"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => setMode("karaoke")}
        >
          KARAOKE
        </Button>
        <Button
          variant="outline"
          className={cn(
            "rounded-full px-6 py-2 text-base font-semibold transition-all duration-300 border-2",
            mode === "non-karaoke"
              ? "border-primary text-primary shadow-[0_0_10px_hsl(var(--primary)),inset_0_0_10px_hsl(var(--primary)/0.5)] bg-primary/10"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => setMode("non-karaoke")}
        >
          NON KARAOKE
        </Button>
      </div>
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
