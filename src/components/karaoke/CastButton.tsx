
"use client";

import { useKaraoke } from "@/context/KaraokeContext";
import { SidebarMenuButton } from "../ui/sidebar";
import { Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CastButton() {
    const { nowPlaying } = useKaraoke();
    const [castReady, setCastReady] = useState(false);
    const [isCasting, setIsCasting] = useState(false);
    const lastCastedVideoId = useRef<string | null>(null);

    const initializeCastApi = () => {
        if (window.cast && window.cast.framework) {
            try {
                const castContext = window.cast.framework.CastContext.getInstance();
                castContext.setOptions({
                    receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                    autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                });
                setCastReady(true);

                castContext.addEventListener(
                    window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                    (event) => {
                        setIsCasting(event.sessionState === window.cast.framework.SessionState.SESSION_STARTED);
                    }
                );
            } catch (e) {
                // The setOptions can fail in sandboxed environment if Presentation API is blocked
                // but we can still try to recover or at least not crash.
                console.warn("CastButton: Could not set cast options. Casting may be limited.", e);
                setCastReady(true); // Set to ready to allow user to click, it might still work.
            }
        }
    };

    useEffect(() => {
        // @ts-ignore
        window['__onGCastApiAvailable'] = (isAvailable) => {
            if (isAvailable) {
                initializeCastApi();
            }
        };

        // If the API is already available, initialize it directly
        if (window.cast && window.cast.framework) {
            initializeCastApi();
        }
    }, []);

    const castVideo = () => {
        const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
        if (!castSession || !nowPlaying) {
            console.log("Not casting: No session or no song playing.");
            return;
        }

        // Avoid re-casting the same video
        if (lastCastedVideoId.current === nowPlaying.youtubeVideoId) {
            return;
        }

        const videoId = nowPlaying.youtubeVideoId;
        const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/youtube');
        mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
        // @ts-ignore
        mediaInfo.metadata.metadataType = window.chrome.cast.media.MetadataType.GENERIC;
        mediaInfo.metadata.title = nowPlaying.title;
        mediaInfo.customData = { "PARTNER_YOUTUBE_ID": videoId };
        
        const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
        
        castSession.loadMedia(request).then(
            () => {
                console.log('Media loaded successfully on TV');
                lastCastedVideoId.current = nowPlaying.youtubeVideoId;
            },
            (errorCode) => {
                console.error('Error loading media on TV:', errorCode);
            }
        );
    };

    const handleCastClick = () => {
        const castContext = window.cast.framework.CastContext.getInstance();
        castContext.requestSession().catch((err) => {
            console.error("Failed to start cast session:", err);
        });
    };

    useEffect(() => {
        if (isCasting && nowPlaying) {
            castVideo();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCasting, nowPlaying]);


    if (!castReady) {
        return (
             <SidebarMenuButton tooltip="Hubungkan ke TV" disabled>
                <Wifi className="text-muted-foreground" />
                <span>Casting...</span>
            </SidebarMenuButton>
        )
    }

    return (
        <SidebarMenuButton tooltip="Hubungkan ke TV" onClick={handleCastClick} isActive={isCasting}>
            <Wifi />
            <span>{isCasting ? "Terhubung ke TV" : "Hubungkan ke TV"}</span>
        </SidebarMenuButton>
    );
}
