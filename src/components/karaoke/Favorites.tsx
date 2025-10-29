
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKaraoke } from "@/context/KaraokeContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, SkipForward, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export default function Favorites() {
  const { favorites, playFromFavorites, addOrRemoveFavorite, isFavorite, playNextFromAnywhere } = useKaraoke();

  return (
    <Card className="h-full flex flex-col mt-[-2rem] xl:mt-0">
      <CardHeader>
        <div>
          <CardTitle className="font-headline flex items-center gap-2">
            <Star className="text-primary" />
            Lagu Favorit
          </CardTitle>
          <CardDescription>
            Lagu-lagu yang telah Anda tandai sebagai favorit.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Lagu</TableHead>
                <TableHead>Artis</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="w-[150px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favorites.map((song) => (
                <TableRow key={song.id.videoId} className="group">
                  <TableCell>
                    <Image
                      src={song.snippet.thumbnails.default.url}
                      alt={song.snippet.title}
                      width={60}
                      height={45}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[200px]">
                    {song.snippet.title}
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">
                    {song.snippet.channelTitle}
                  </TableCell>
                  <TableCell>
                    <Badge variant={song.mode === 'karaoke' ? 'default' : 'secondary'} className="uppercase">
                        {song.mode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:text-yellow-400"
                        onClick={() => addOrRemoveFavorite(song, song.mode)}
                      >
                        <Star className={cn("h-4 w-4", isFavorite(song.id.videoId) ? "fill-yellow-400 text-yellow-400" : "")} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:text-primary"
                        onClick={() => playNextFromAnywhere(song, song.mode)}
                        title="Antrikan Berikutnya"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:text-primary"
                        onClick={() => playFromFavorites(song)}
                         title="Putar Sekarang"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {favorites.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground h-48"
                  >
                    Anda belum memiliki lagu favorit.
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
