import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";

const queue = [
  { title: "Bohemian Rhapsody", artist: "Queen", addedBy: "User1" },
  { title: "I Will Survive", artist: "Gloria Gaynor", addedBy: "User2" },
  { title: "Hotel California", artist: "Eagles", addedBy: "User1" },
  { title: "Sweet Caroline", artist: "Neil Diamond", addedBy: "User3" },
  { title: "Don't Stop Believin'", artist: "Journey", addedBy: "User2" },
  { title: "Wonderwall", artist: "Oasis", addedBy: "User1" },
];

export default function SongQueue() {
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
                <TableHead>Lagu</TableHead>
                <TableHead>Artis</TableHead>
                <TableHead className="text-right">Ditambahkan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((song, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{song.addedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
