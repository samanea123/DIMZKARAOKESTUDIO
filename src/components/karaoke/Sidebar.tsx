"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Home, Heart, Clock, Settings, Tv2, Monitor } from "lucide-react";
import { Button } from "../ui/button";
import { useKaraoke } from "@/context/KaraokeContext";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "Beranda", path: "/", icon: <Home size={20} /> },
    { name: "Favorit", path: "/favorites", icon: <Heart size={20} /> },
    { name: "Riwayat", path: "/history", icon: <Clock size={20} /> },
  ];
  
  const actionItems = [
    { name: "Hubungkan ke TV", path: "/connect", icon: <Tv2 size={18} /> },
    { name: "Buka Monitor", path: "/monitor", icon: <Monitor size={18} /> },
    { name: "Pengaturan", path: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Tombol toggle (khusus untuk layar kecil) */}
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm"
        onClick={() => setOpen(!open)}
      >
        <Menu size={24} />
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card text-card-foreground p-4 flex flex-col justify-between transition-transform duration-300 z-40 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
           <div className="text-2xl font-bold text-center py-4 border-b border-border font-headline mb-4">
                DIMZ
            </div>
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-border pt-4">
            {actionItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                target={item.path === '/monitor' ? '_blank' : '_self'}
                rel={item.path === '/monitor' ? 'noopener noreferrer' : ''}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition hover:bg-accent"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
        </div>
      </aside>
    </>
  );
}
