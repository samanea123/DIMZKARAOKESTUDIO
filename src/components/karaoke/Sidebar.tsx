
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Clock, Heart, Monitor, Settings, HelpCircle } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const menuItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Riwayat", href: "/history", icon: Clock },
  { name: "Favorit", href: "/favorites", icon: Heart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-card text-card-foreground flex-col z-50 hidden md:flex">
      {/* Logo */}
      <div className="text-2xl font-bold text-center py-6 border-b border-border font-headline">
        DIMZ
      </div>

      {/* Menu Utama */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <Icon size={18} />
            {name}
          </Link>
        ))}
        {/* Separator for other actions */}
         <div className="pt-2">
            <a
                href="/monitor"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-foreground hover:bg-accent`}
            >
                <Monitor size={18} />
                Buka Monitor
            </a>
            <button
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-foreground hover:bg-accent`}
            >
                <Settings size={18} />
                Pengaturan
            </button>
        </div>
      </nav>

      {/* Bantuan & User */}
      <div className="border-t border-border p-4 space-y-3">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-full">
          <HelpCircle size={18} /> Bantuan
        </button>

        <div className="flex items-center gap-3 mt-3">
            <Avatar className="size-8">
                <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
          <div>
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">user@email.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
