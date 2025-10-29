
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { useKaraoke } from "@/context/KaraokeContext";
import Image from "next/image";
import { Button } from "../ui/button";
import { Play, SkipForward, Trash2 } from "lucide-react";

export default function SongQueue() {
  const { queue, playSongFromQueue, playNextSong, removeSongFromQueue, addSongToPlayNext } = useKaraoke();

  const handleRemoveSong = (e: React.MouseEvent, videoId: string, isNowPlaying: boolean) => {
    e.stopPropagation();
    if (isNowPlaying) {
        playNextSong();
    } else {
        removeSongFromQueue(videoId);
    }
  }

  return (
    <Card className="h-full flex flex-col bg-transparent xl:bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Daftar Antrian</CardTitle>
        {queue.length > 1 && (
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
                <TableHead className="w-[120px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((song, index) => (
                <TableRow 
                  key={`${song.id.videoId}-${index}`} 
                  className={index === 0 ? "bg-primary/10 group" : "group"}
                >
                  <TableCell>
                    <Image
                      src={song.snippet.thumbnails.default.url}
                      alt={song.snippet.title}
                      width={60}
                      height={45}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[150px]">{song.snippet.title}</TableCell>
                  <TableCell className="truncate max-w-[100px]">{song.snippet.channelTitle}</TableCell>
                  <TableCell className="text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end items-center gap-1">
                      {index > 0 && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:text-primary"
                            title="Putar Sekarang"
                            onClick={() => playSongFromQueue(song.id.videoId)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Antrikan Berikutnya"
                            onClick={() => addSongToPlayNext(song)}
                          >
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title="Hapus dari antrian"
                        onClick={(e) => handleRemoveSong(e, song.id.videoId, index === 0)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {queue.length === 0 && (
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
