
"use client";

import { Monitor } from "lucide-react";
import { SidebarMenuButton } from "../ui/sidebar";
import { useKaraoke } from "@/context/KaraokeContext";

export default function MonitorController() {
    const { openMonitor } = useKaraoke();

    return (
        <SidebarMenuButton tooltip="Buka Monitor" onClick={openMonitor}>
            <Monitor />
            <span>Buka Monitor</span>
        </SidebarMenuButton>
    )
}
