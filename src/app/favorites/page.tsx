
"use client";

import Favorites from "@/components/karaoke/Favorites";
import { KaraokeProvider } from "@/context/KaraokeContext";

function FavoritesPageContent() {
  return (
    <div className="flex-1 flex flex-col h-screen">
        <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
            <Favorites />
        </div>
    </div>
  );
}


export default function FavoritesPage() {
  return (
    <KaraokeProvider>
        <FavoritesPageContent />
    </KaraokeProvider>
  );
}
