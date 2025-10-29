"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Mic, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type FilterMode = "karaoke" | "non-karaoke";

export default function SongSearch() {
  const [mode, setMode] = useState<FilterMode>("karaoke");

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
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          type="search"
          placeholder="Cari lagu atau artis..."
          className="pl-12 pr-12 h-14 text-lg bg-card border-2 border-border focus:border-primary focus:ring-primary/50"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
          <Mic />
        </button>
      </div>
    </div>
  );
}
