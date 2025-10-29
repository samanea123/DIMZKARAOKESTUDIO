
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
import { History as HistoryIcon, Play, Star, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export default function History() {
  const { songHistory, playFromHistory, clearHistory, addOrRemoveFavorite, isFavorite } = useKaraoke();

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Card className="h-full flex flex-col mt-[-2rem] xl:mt-0">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline flex items-center gap-2">
            <HistoryIcon className="text-primary" />
            Riwayat Lagu
          </CardTitle>
          <CardDescription>
            Lagu-lagu yang sudah pernah Anda putar.
          </CardDescription>
        </div>
        {songHistory.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Riwayat
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus semua riwayat lagu Anda secara permanen.
                  Data yang sudah dihapus tidak dapat dikembalikan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>
                  Ya, Hapus Semua
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                <TableHead>Mode</TableHead>
                <TableHead>Terakhir Diputar</TableHead>
                <TableHead className="w-[150px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songHistory.map((song) => (
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
                  <TableCell>{formatDateTime(song.playedAt)}</TableCell>
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
                        onClick={() => playFromHistory(song)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {songHistory.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground h-48"
                  >
                    Riwayat lagu masih kosong.
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
