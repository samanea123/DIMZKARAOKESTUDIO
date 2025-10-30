"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Tv, Monitor, Music, Heart, Clock } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: "Beranda", path: "/", icon: <Music size={18} /> },
    { name: "Favorit", path: "/favorites", icon: <Heart size={18} /> },
    { name: "Riwayat", path: "/history", icon: <Clock size={18} /> },
    { name: "Hubungkan ke TV", path: "/connect", icon: <Tv size={18} /> },
    { name: "Buka Monitor", path: "/monitor", icon: <Monitor size={18} /> },
  ];

  return (
    <>
      {/* 🔹 Tombol Hamburger (muncul hanya di HP/Tablet) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg shadow-lg"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* 🔹 Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-card text-card-foreground p-4 flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="text-2xl font-bold text-center py-4 border-b border-border font-headline mb-4">
          DIMZ
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
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

      {/* 🔹 Overlay saat sidebar terbuka di HP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
