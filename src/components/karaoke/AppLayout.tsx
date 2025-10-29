"use client";

import {
  HelpCircle,
  Home,
  ListMusic,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { KaraokeProvider } from "@/context/KaraokeContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <KaraokeProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex-1 overflow-hidden">
                  <h2 className="text-lg font-semibold whitespace-nowrap font-headline">DIMZ</h2>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Beranda" isActive>
                  <Home />
                  <span>Beranda</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Antrian">
                  <ListMusic />
                  <span>Antrian</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Pengaturan">
                  <Settings />
                  <span>Pengaturan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Bantuan">
                  <HelpCircle />
                  <span>Bantuan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton tooltip="User Profile" size="lg">
                      <Avatar className="size-8">
                          <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                          <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">User</span>
                          <span className="text-xs text-muted-foreground">user@email.com</span>
                      </div>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </KaraokeProvider>
  );
}
