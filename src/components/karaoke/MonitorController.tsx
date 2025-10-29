
"use client";

import { Monitor } from "lucide-react";
import { SidebarMenuButton } from "../ui/sidebar";
import { useEffect, useState } from "react";

export default function MonitorController() {
    const [monitorWindow, setMonitorWindow] = useState<Window | null>(null);

    const openMonitor = () => {
        const newWindow = window.open('/monitor', 'karaoke-monitor', 'width=800,height=600');
        setMonitorWindow(newWindow);
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (monitorWindow && !monitorWindow.closed) {
                monitorWindow.close();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (monitorWindow && !monitorWindow.closed) {
                monitorWindow.close();
            }
        };
    }, [monitorWindow]);


    return (
        <SidebarMenuButton tooltip="Buka Monitor" onClick={openMonitor}>
            <Monitor />
            <span>Buka Monitor</span>
        </SidebarMenuButton>
    )
}
