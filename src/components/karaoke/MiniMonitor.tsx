import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";

export default function MiniMonitor() {
  return (
    <Card className="h-full flex flex-col bg-black/50 border-2 border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
      <CardHeader>
        <CardTitle className="font-headline text-primary/80">Layar Monitor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center text-2xl md:text-3xl lg:text-4xl font-bold leading-loose text-gray-500 font-sans">
        <p>You are the dancing queen</p>
        <p className="text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary))' }}>
          Young and sweet, only seventeen
        </p>
        <p>Dancing queen</p>
        <p>Feel the beat from the tambourine, oh yeah</p>
      </CardContent>
      <CardFooter className="bg-black/30 p-4 border-t border-primary/20">
        <div className="flex items-center gap-4">
          <Music className="text-primary" size={24} />
          <div>
            <p className="font-semibold text-white">Dancing Queen</p>
            <p className="text-sm text-muted-foreground">ABBA</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
