
"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Don't show the layout for the monitor page
  if (pathname === '/monitor') {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-0 md:pl-64">
        {children}
      </main>
    </div>
  );
}
