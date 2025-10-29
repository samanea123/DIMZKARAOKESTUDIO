"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { useKaraoke } from "@/context/KaraokeContext";
import Image from "next/image";

export default function SongQueue() {
  const { queue } = useKaraoke();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Daftar Antrian</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Lagu</TableHead>
                <TableHead>Artis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((song, index) => (
                <TableRow key={`${song.id.videoId}-${index}`} className={index === 0 ? "bg-primary/10" : ""}>
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
