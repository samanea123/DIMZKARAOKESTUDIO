
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { useKaraoke } from "@/context/KaraokeContext";
import Image from "next/image";
import { Button } from "../ui/button";
import { Loader, Play, SkipForward, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SongQueue() {
  const { queue, isQueueLoading, playSongFromQueue, playNextSong, removeSongFromQueue, addSongToPlayNext } = useKaraoke();

  const handleRemoveSong = (e: React.MouseEvent, docId: string, isNowPlaying: boolean) => {
    e.stopPropagation();
    if (isNowPlaying) {
        playNextSong();
    } else {
        removeSongFromQueue(docId);
    }
  }

  return (
    <Card className="h-full flex flex-col bg-transparent xl:bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Daftar Antrian</CardTitle>
        {queue && queue.length > 1 && (
            <Button size="sm" variant="outline" onClick={playNextSong}>
                <SkipForward className="h-4 w-4 mr-2"/>
                Lagu Berikutnya
            </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Lagu</TableHead>
                <TableHead>Artis</TableHead>
                <TableHead className="w-[120px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isQueueLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader className="mx-auto animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              )}
              {!isQueueLoading && queue.map((song, index) => (
                <TableRow 
                  key={song.id} 
                  className={cn("group", index === 0 && "bg-primary/10")}
                >
                  <TableCell>
                    <div className="relative w-[60px] h-[45px]">
                      <Image
                        src={song.thumbnails.default.url}
                        alt={song.title}
                        fill
                        className="rounded-md object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Play className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[150px]">{song.title}</TableCell>
                  <TableCell className="truncate max-w-[100px]">{song.channelTitle}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-400 hover:text-green-500"
                        title={index === 0 ? "Putar Ulang" : "Putar Sekarang"}
                        onClick={() => playSongFromQueue(song.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-yellow-400 hover:text-yellow-500"
                        title="Antrikan Berikutnya"
                        onClick={() => addSongToPlayNext(song)}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        title="Hapus dari antrian"
                        onClick={(e) => handleRemoveSong(e, song.id, index === 0)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isQueueLoading && queue.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        Antrian masih kosong.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
