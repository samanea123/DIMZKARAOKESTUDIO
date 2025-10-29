
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
import { History as HistoryIcon, Play, Trash2 } from "lucide-react";
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

export default function History() {
  const { songHistory, playFromHistory, clearHistory } = useKaraoke();

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
                <TableHead>Terakhir Diputar</TableHead>
                <TableHead className="w-[100px] text-right">Aksi</TableHead>
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
                  <TableCell>{formatDateTime(song.playedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => playFromHistory(song)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Putar Ulang
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {songHistory.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
