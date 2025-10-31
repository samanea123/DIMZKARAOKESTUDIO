"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, History, Home, Monitor, Tv2 } from "lucide-react";
import { useKaraoke } from "@/context/KaraokeContext";

export default function MainMenu() {
  const pathname = usePathname();
  const { openMonitor } = useKaraoke();

  const menuItems = [
    { name: "Beranda", path: "/", icon: <Home size={16} /> },
    { name: "Favorit", path: "/favorites", icon: <Heart size={16} /> },
    { name: "Riwayat", path: "/history", icon: <History size={16} /> },
  ];

  const actionItems = [
    { name: "Hubungkan ke TV", path: "/connect", icon: <Tv2 size={16} /> },
    { name: "Buka Monitor", onClick: openMonitor, icon: <Monitor size={16} /> },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-center gap-2">
      <div className="flex items-center gap-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={isActive(item.path) ? "default" : "outline"}
            className={cn("transition-all", { "shadow-[0_0_10px_hsl(var(--primary))]": isActive(item.path) })}
          >
            <Link href={item.path}>
              {item.icon}
              {item.name}
            </Link>
          </Button>
        ))}
      </div>
      <div className="hidden sm:block h-8 w-px bg-border mx-2"></div>
      <div className="flex items-center gap-2">
        {actionItems.map((item) =>
          item.path ? (
            <Button
              key={item.name}
              asChild
              variant={isActive(item.path) ? "default" : "outline"}
               className={cn("transition-all", { "shadow-[0_0_10px_hsl(var(--primary))]": isActive(item.path) })}
            >
              <Link href={item.path}>
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ) : (
            <Button
              key={item.name}
              onClick={item.onClick}
              variant="outline"
            >
              {item.icon}
              {item.name}
            </Button>
          )
        )}
      </div>
    </nav>
  );
}
