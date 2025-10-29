import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Play } from "lucide-react";

export default function TopHits() {
  const topSongs = PlaceHolderImages.slice(0, 20);

  return (
    <div>
      <h2 className="text-2xl font-headline font-semibold mb-4">Top 20 Hits</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {topSongs.map((song) => (
            <CarouselItem key={song.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <div className="p-1">
                <Card className="overflow-hidden group hover:border-primary transition-colors">
                  <CardContent className="p-0 relative aspect-square">
                    <Image
                      src={song.imageUrl}
                      alt={song.description}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      data-ai-hint={song.imageHint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </CardContent>
                  <CardHeader className="p-3 absolute bottom-0 w-full">
                    <CardTitle className="text-sm font-semibold text-white truncate">{song.title}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </CardHeader>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Button size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 h-12 w-12 bg-primary/80 backdrop-blur-sm hover:bg-primary">
                        <Play className="fill-primary-foreground" />
                    </Button>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
