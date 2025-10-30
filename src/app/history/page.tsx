
"use client";

import History from "@/components/karaoke/History";
import { KaraokeProvider } from "@/context/KaraokeContext";

function HistoryPageContent() {
  return (
    <div className="flex-1 flex flex-col h-screen">
        <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
            <History />
        </div>
    </div>
  );
}


export default function HistoryPage() {
  return (
    <KaraokeProvider>
        <HistoryPageContent />
    </KaraokeProvider>
  );
}
