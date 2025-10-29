import { Input } from "@/components/ui/input";
import { Mic, Search } from "lucide-react";

export default function SongSearch() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
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
  );
}
